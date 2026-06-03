package main

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	MongoClient        *mongo.Client
	Database           *mongo.Database
	UsersCollection    *mongo.Collection
	ToursCollection    *mongo.Collection
	DestCollection     *mongo.Collection
	BookingsCollection *mongo.Collection
	AviaturyCollection *mongo.Collection
	AnalyticsColl      *mongo.Collection
)

func InitDB() {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		uri = "mongodb://localhost:27017/tripsforua"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Fatalf("❌ Failed to connect to MongoDB: %v", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("❌ Failed to ping MongoDB: %v", err)
	}

	MongoClient = client
	// Extract database name from URI or use default
	dbName := "tripsforua"
	Database = client.Database(dbName)

	UsersCollection = Database.Collection("users")
	ToursCollection = Database.Collection("tours")
	DestCollection = Database.Collection("destinations")
	BookingsCollection = Database.Collection("bookings")
	AviaturyCollection = Database.Collection("aviatury")
	AnalyticsColl = Database.Collection("analytics")

	log.Println("✅ MongoDB connected successfully in Go")
}
