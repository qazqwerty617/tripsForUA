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

func GetDestinationsHandler(c *gin.Context) {
	opts := options.Find().SetSort(bson.M{"popularityScore": -1})
	ctx := context.Background()

	cursor, err := DestCollection.Find(ctx, bson.M{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	destinations := []Destination{}
	if err = cursor.All(ctx, &destinations); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	if destinations == nil {
		destinations = []Destination{}
	}

	c.JSON(http.StatusOK, destinations)
}

func GetDestinationBySlugHandler(c *gin.Context) {
	slug := c.Param("slug")

	var dest Destination
	ctx := context.Background()
	err := DestCollection.FindOne(ctx, bson.M{"slug": slug}).Decode(&dest)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Напрямок не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, dest)
}

func CreateDestinationHandler(c *gin.Context) {
	var body Destination
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний формат запиту", "error": err.Error()})
		return
	}

	body.ID = primitive.NewObjectID()
	body.CreatedAt = time.Now()
	body.UpdatedAt = time.Now()

	ctx := context.Background()
	_, err := DestCollection.InsertOne(ctx, body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, body)
}

func UpdateDestinationHandler(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID напрямку"})
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
	var dest Destination
	err = DestCollection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$set": updateData},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&dest)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Напрямок не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, dest)
}

func DeleteDestinationHandler(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний ID напрямку"})
		return
	}

	ctx := context.Background()
	var dest Destination
	err = DestCollection.FindOneAndDelete(ctx, bson.M{"_id": objID}).Decode(&dest)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "Напрямок не знайдено"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Напрямок видалено"})
}
