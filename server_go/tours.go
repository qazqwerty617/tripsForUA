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

func populateTour(ctx context.Context, tour *Tour) {
	if tour.Destination != nil {
		var dest Destination
		err := DestCollection.FindOne(ctx, bson.M{"_id": *tour.Destination}).Decode(&dest)
		if err == nil {
			tour.DestinationData = &dest
		}
	}
}

func GetToursHandler(c *gin.Context) {
	destination := c.Query("destination")
	status := c.Query("status")
	featured := c.Query("featured")
	fromStr := c.Query("from")
	toStr := c.Query("to")

	query := bson.M{}

	if destination != "" {
		destID, err := primitive.ObjectIDFromHex(destination)
		if err == nil {
			query["destination"] = destID
		}
	}
	if status != "" {
		query["status"] = status
	}
	if featured == "true" {
		query["featured"] = true
	} else if featured == "false" {
		query["featured"] = false
	}

	opts := options.Find().SetSort(bson.D{
		{Key: "order", Value: 1},
		{Key: "featured", Value: -1},
		{Key: "startDate", Value: 1},
	})

	ctx := context.Background()
	cursor, err := ToursCollection.Find(ctx, query, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	allTours := []Tour{}
	if err = cursor.All(ctx, &allTours); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	if allTours == nil {
		allTours = []Tour{}
	}

	for i := range allTours {
		populateTour(ctx, &allTours[i])
	}

	// Date range filtering on server side
	if fromStr != "" || toStr != "" {
		var fromDate, toDate time.Time
		var parseFromErr, parseToErr error

		if fromStr != "" {
			fromDate, parseFromErr = time.Parse("2006-01-02", fromStr)
		}
		if toStr != "" {
			toDate, parseToErr = time.Parse("2006-01-02", toStr)
			if parseToErr == nil {
				// Set to end of day
				toDate = toDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second + 999*time.Millisecond)
			}
		}

		if parseFromErr == nil && parseToErr == nil {
			var filteredTours []Tour
			for _, tour := range allTours {
				datesToCheck := tour.AvailableDates
				if len(datesToCheck) == 0 {
					datesToCheck = []time.Time{tour.StartDate}
				}

				match := false
				for _, date := range datesToCheck {
					// Normalize checking date
					d := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())

					if fromStr != "" && toStr != "" {
						if (d.After(fromDate) || d.Equal(fromDate)) && (d.Before(toDate) || d.Equal(toDate)) {
							match = true
							break
						}
					} else if fromStr != "" {
						if d.After(fromDate) || d.Equal(fromDate) {
							match = true
							break
						}
					} else if toStr != "" {
						if d.Before(toDate) || d.Equal(toDate) {
							match = true
							break
						}
					}
				}

				if match {
					filteredTours = append(filteredTours, tour)
				}
			}
			allTours = filteredTours
		}
	}

	c.JSON(http.StatusOK, allTours)
}

func GetTourByIDHandler(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID туру"})
		return
	}

	var tour Tour
	ctx := context.Background()
	err = ToursCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&tour)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Тур не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	populateTour(ctx, &tour)
	c.JSON(http.StatusOK, tour)
}

func CreateTourHandler(c *gin.Context) {
	var body Tour
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний формат запиту", "error": err.Error()})
		return
	}

	body.ID = primitive.NewObjectID()
	body.CreatedAt = time.Now()
	body.UpdatedAt = time.Now()

	ctx := context.Background()
	_, err := ToursCollection.InsertOne(ctx, body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	populateTour(ctx, &body)
	c.JSON(http.StatusCreated, body)
}

func UpdateTourHandler(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID туру"})
		return
	}

	var updateData bson.M
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний формат запиту", "error": err.Error()})
		return
	}

	// Remove system fields if present
	delete(updateData, "_id")
	delete(updateData, "createdAt")
	updateData["updatedAt"] = time.Now()

	// Parse date fields if they are strings in the json payload
	for _, field := range []string{"startDate", "endDate"} {
		if val, exists := updateData[field]; exists {
			if strVal, ok := val.(string); ok {
				if parsedTime, parseErr := time.Parse(time.RFC3339, strVal); parseErr == nil {
					updateData[field] = parsedTime
				} else if parsedTime, parseErr := time.Parse("2006-01-02", strVal); parseErr == nil {
					updateData[field] = parsedTime
				}
			}
		}
	}
	if val, exists := updateData["availableDates"]; exists {
		if sliceVal, ok := val.([]interface{}); ok {
			var parsedDates []time.Time
			for _, dateItem := range sliceVal {
				if strVal, ok := dateItem.(string); ok {
					if parsedTime, parseErr := time.Parse(time.RFC3339, strVal); parseErr == nil {
						parsedDates = append(parsedDates, parsedTime)
					} else if parsedTime, parseErr := time.Parse("2006-01-02", strVal); parseErr == nil {
						parsedDates = append(parsedDates, parsedTime)
					}
				}
			}
			if len(parsedDates) > 0 {
				updateData["availableDates"] = parsedDates
			}
		}
	}

	// Handle destination reference ObjectID parsing
	if destVal, exists := updateData["destination"]; exists {
		if destStr, ok := destVal.(string); ok && destStr != "" {
			destObjID, err := primitive.ObjectIDFromHex(destStr)
			if err == nil {
				updateData["destination"] = destObjID
			}
		}
	}

	ctx := context.Background()
	var tour Tour
	err = ToursCollection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$set": updateData},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&tour)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Тур не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	populateTour(ctx, &tour)
	c.JSON(http.StatusOK, tour)
}

func DeleteTourHandler(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID туру"})
		return
	}

	ctx := context.Background()
	var tour Tour
	err = ToursCollection.FindOneAndDelete(ctx, bson.M{"_id": objID}).Decode(&tour)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Тур не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Тур видалено"})
}

func ReorderToursHandler(c *gin.Context) {
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
			_, _ = ToursCollection.UpdateOne(
				ctx,
				bson.M{"_id": objID},
				bson.M{"$set": bson.M{"order": index}},
			)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Порядок оновлено"})
}
