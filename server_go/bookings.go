package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func populateBooking(ctx context.Context, booking *Booking) {
	var tour Tour
	err := ToursCollection.FindOne(ctx, bson.M{"_id": booking.Tour}).Decode(&tour)
	if err == nil {
		populateTour(ctx, &tour)
		booking.TourData = &tour
	}
}

func GetBookingsHandler(c *gin.Context) {
	opts := options.Find().SetSort(bson.M{"createdAt": -1})
	ctx := context.Background()

	cursor, err := BookingsCollection.Find(ctx, bson.M{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	bookings := []Booking{}
	if err = cursor.All(ctx, &bookings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	if bookings == nil {
		bookings = []Booking{}
	}

	for i := range bookings {
		populateBooking(ctx, &bookings[i])
	}

	c.JSON(http.StatusOK, bookings)
}

func CreateBookingHandler(c *gin.Context) {
	var body struct {
		Tour           string `json:"tour"`
		CustomerName   string `json:"customerName"`
		CustomerEmail  string `json:"customerEmail"`
		CustomerPhone  string `json:"customerPhone"`
		NumberOfPeople int    `json:"numberOfPeople"`
		Notes          string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний формат запиту", "error": err.Error()})
		return
	}

	tourObjID, err := primitive.ObjectIDFromHex(body.Tour)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID туру"})
		return
	}

	ctx := context.Background()
	var tour Tour
	err = ToursCollection.FindOne(ctx, bson.M{"_id": tourObjID}).Decode(&tour)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Тур не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	if tour.AvailableSpots < body.NumberOfPeople {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Недостатньо вільних місць"})
		return
	}

	totalPrice := tour.Price * float64(body.NumberOfPeople)

	booking := Booking{
		ID:             primitive.NewObjectID(),
		Tour:           tourObjID,
		CustomerName:   body.CustomerName,
		CustomerEmail:  body.CustomerEmail,
		CustomerPhone:  body.CustomerPhone,
		NumberOfPeople: body.NumberOfPeople,
		TotalPrice:     totalPrice,
		Status:         "pending",
		Notes:          body.Notes,
		PaymentStatus:  "pending",
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err = BookingsCollection.InsertOne(ctx, booking)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	// Update available spots
	newSpots := tour.AvailableSpots - body.NumberOfPeople
	_, err = ToursCollection.UpdateOne(
		ctx,
		bson.M{"_id": tourObjID},
		bson.M{"$set": bson.M{"availableSpots": newSpots}},
	)
	if err != nil {
		log.Printf("⚠️ Failed to update available spots for tour %s: %v", tour.ID.Hex(), err)
	}

	populateBooking(ctx, &booking)
	c.JSON(http.StatusCreated, booking)
}

func UpdateBookingHandler(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID бронювання"})
		return
	}

	var updateData bson.M
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний формат запиту", "error": err.Error()})
		return
	}

	delete(updateData, "_id")
	delete(updateData, "createdAt")
	updateData["updatedAt"] = time.Now()

	ctx := context.Background()
	var booking Booking
	err = BookingsCollection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$set": updateData},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&booking)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Бронювання не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	populateBooking(ctx, &booking)
	c.JSON(http.StatusOK, booking)
}
