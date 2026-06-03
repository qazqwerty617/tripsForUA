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

func GetAviaturyHandler(c *gin.Context) {
	status := c.Query("status")
	fromStr := c.Query("from")
	toStr := c.Query("to")

	query := bson.M{}

	if status != "" {
		query["status"] = status
	}

	if fromStr != "" || toStr != "" {
		dateFilter := bson.M{}
		if fromStr != "" {
			if fromDate, err := time.Parse("2006-01-02", fromStr); err == nil {
				dateFilter["$gte"] = fromDate
			}
		}
		if toStr != "" {
			if toDate, err := time.Parse("2006-01-02", toStr); err == nil {
				// Set to end of day to make lte inclusive
				toDate = toDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second + 999*time.Millisecond)
				dateFilter["$lte"] = toDate
			}
		}
		if len(dateFilter) > 0 {
			query["availableFrom"] = dateFilter
		}
	}

	opts := options.Find().SetSort(bson.D{
		{Key: "order", Value: 1},
		{Key: "hot", Value: -1},
		{Key: "createdAt", Value: -1},
	})

	ctx := context.Background()
	cursor, err := AviaturyCollection.Find(ctx, query, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	aviatury := []Aviatur{}
	if err = cursor.All(ctx, &aviatury); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	if aviatury == nil {
		aviatury = []Aviatur{}
	}

	c.JSON(http.StatusOK, aviatury)
}

func GetAviaturByIDHandler(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID авіатуру"})
		return
	}

	var aviatur Aviatur
	ctx := context.Background()
	err = AviaturyCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&aviatur)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Авіатур не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, aviatur)
}

func CreateAviaturHandler(c *gin.Context) {
	var body Aviatur
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний формат запиту", "error": err.Error()})
		return
	}

	body.ID = primitive.NewObjectID()
	body.CreatedAt = time.Now()
	body.UpdatedAt = time.Now()

	ctx := context.Background()
	_, err := AviaturyCollection.InsertOne(ctx, body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, body)
}

func UpdateAviaturHandler(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID авіатуру"})
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

	// Parse date fields if strings
	for _, field := range []string{"availableFrom", "availableTo"} {
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

	ctx := context.Background()
	var aviatur Aviatur
	err = AviaturyCollection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$set": updateData},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&aviatur)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Авіатур не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, aviatur)
}

func DeleteAviaturHandler(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID авіатуру"})
		return
	}

	ctx := context.Background()
	var aviatur Aviatur
	err = AviaturyCollection.FindOneAndDelete(ctx, bson.M{"_id": objID}).Decode(&aviatur)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Авіатур не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Авіатур видалено"})
}

func ReorderAviaturyHandler(c *gin.Context) {
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
			_, _ = AviaturyCollection.UpdateOne(
				ctx,
				bson.M{"_id": objID},
				bson.M{"$set": bson.M{"order": index}},
			)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Порядок оновлено"})
}
