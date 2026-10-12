package main

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetReviewsHandler(c *gin.Context) {
	all := c.Query("all")
	tourIDStr := c.Query("tourId")

	filter := bson.M{}
	if all != "true" {
		filter["isPublished"] = true
	}

	if tourIDStr != "" {
		if objID, err := primitive.ObjectIDFromHex(tourIDStr); err == nil {
			filter["tourId"] = objID
		}
	}

	opts := options.Find().SetSort(bson.D{{Key: "order", Value: 1}, {Key: "createdAt", Value: -1}})
	ctx := context.Background()

	cursor, err := ReviewsCollection.Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	reviews := []Review{}
	if err = cursor.All(ctx, &reviews); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	if reviews == nil {
		reviews = []Review{}
	}

	c.JSON(http.StatusOK, reviews)
}

func GetReviewByIDHandler(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID відгуку"})
		return
	}

	var review Review
	ctx := context.Background()
	err = ReviewsCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&review)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Відгук не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, review)
}

func CreateReviewHandler(c *gin.Context) {
	var body Review
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний формат запиту", "error": err.Error()})
		return
	}

	if body.TourTitle == "" || body.TravelDate == "" || body.AuthorName == "" || body.Text == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Будь ласка, заповніть обовʼязкові поля: назва туру, дата, автор та текст"})
		return
	}

	if body.Rating == 0 {
		body.Rating = 5
	}
	if body.Photos == nil {
		body.Photos = []string{}
	}

	body.ID = primitive.NewObjectID()
	body.CreatedAt = time.Now()
	body.UpdatedAt = time.Now()

	ctx := context.Background()
	_, err := ReviewsCollection.InsertOne(ctx, body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, body)
}

func UpdateReviewHandler(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID відгуку"})
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

	// Handle tourId if passed as string
	if tid, ok := updateData["tourId"].(string); ok {
		if tid != "" {
			if parsedTID, err := primitive.ObjectIDFromHex(tid); err == nil {
				updateData["tourId"] = parsedTID
			}
		} else {
			delete(updateData, "tourId")
		}
	}

	ctx := context.Background()
	var review Review
	err = ReviewsCollection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$set": updateData},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&review)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Відгук не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, review)
}

func DeleteReviewHandler(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID відгуку"})
		return
	}

	ctx := context.Background()
	var review Review
	err = ReviewsCollection.FindOneAndDelete(ctx, bson.M{"_id": objID}).Decode(&review)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Відгук не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Відгук видалено"})
}

func ReorderReviewsHandler(c *gin.Context) {
	var body struct {
		OrderedIDs []string `json:"orderedIds"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний формат запиту"})
		return
	}

	ctx := context.Background()
	for index, idStr := range body.OrderedIDs {
		objID, err := primitive.ObjectIDFromHex(idStr)
		if err == nil {
			_, _ = ReviewsCollection.UpdateOne(
				ctx,
				bson.M{"_id": objID},
				bson.M{"$set": bson.M{"order": index}},
			)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Порядок оновлено"})
}
