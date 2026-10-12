package main

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func getDeviceType(userAgent string) string {
	if userAgent == "" {
		return "unknown"
	}
	ua := strings.ToLower(userAgent)
	if strings.Contains(ua, "ipad") || strings.Contains(ua, "tablet") {
		return "tablet"
	}
	if strings.Contains(ua, "mobile") || strings.Contains(ua, "android") || strings.Contains(ua, "iphone") || strings.Contains(ua, "ipod") || strings.Contains(ua, "windows phone") {
		return "mobile"
	}
	return "desktop"
}

func getClientIP(c *gin.Context) string {
	ip := c.GetHeader("cf-connecting-ip")
	if ip == "" {
		ip = c.GetHeader("x-real-ip")
	}
	if ip == "" {
		if xff := c.GetHeader("x-forwarded-for"); xff != "" {
			ip = strings.TrimSpace(strings.Split(xff, ",")[0])
		}
	}
	if ip == "" {
		ip = c.ClientIP()
	}

	if strings.HasPrefix(ip, "::ffff:") {
		ip = strings.TrimPrefix(ip, "::ffff:")
	}
	return ip
}

func RecordViewHandler(c *gin.Context) {
	var body struct {
		ItemID   string           `json:"itemId"`
		ItemType string           `json:"itemType"`
		Source   *AnalyticsSource `json:"source"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "itemId and itemType are required"})
		return
	}

	if body.ItemID == "" || body.ItemType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "itemId and itemType are required"})
		return
	}

	if body.ItemType != "Tour" && body.ItemType != "Aviatur" && body.ItemType != "Social" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "itemType must be Tour, Aviatur or Social"})
		return
	}

	userAgent := c.GetHeader("User-Agent")
	ip := getClientIP(c)

	// Async record and GeoIP resolution so it doesn't block the request
	go func(ip, userAgent, itemType, itemIdStr string, source *AnalyticsSource) {
		device := getDeviceType(userAgent)
		country := "Unknown"

		// Skip localhost/private lookup
		isLocal := ip == "" || ip == "127.0.0.1" || ip == "::1" || ip == "localhost" ||
			strings.HasPrefix(ip, "192.168.") || strings.HasPrefix(ip, "10.")

		if !isLocal {
			client := http.Client{Timeout: 1 * time.Second}
			resp, err := client.Get("http://ip-api.com/json/" + ip)
			if err == nil {
				defer resp.Body.Close()
				var result struct {
					CountryCode string `json:"countryCode"`
				}
				if json.NewDecoder(resp.Body).Decode(&result) == nil && result.CountryCode != "" {
					country = result.CountryCode
				}
			}
		}

		var itemId interface{}
		if objID, err := primitive.ObjectIDFromHex(itemIdStr); err == nil {
			itemId = objID
		} else {
			itemId = itemIdStr
		}

		doc := Analytics{
			ID:        primitive.NewObjectID(),
			ItemID:    itemId,
			ItemType:  itemType,
			Source:    source,
			ViewedAt:  time.Now(),
			UserAgent: userAgent,
			Device:    device,
			Country:   country,
			IP:        ip,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		_, _ = AnalyticsColl.InsertOne(context.Background(), doc)
	}(ip, userAgent, body.ItemType, body.ItemID, body.Source)

	c.JSON(http.StatusCreated, gin.H{"success": true})
}

func GetAnalyticsStatsHandler(c *gin.Context) {
	period := c.DefaultQuery("period", "7d")

	var startDate time.Time
	switch period {
	case "24h":
		startDate = time.Now().Add(-24 * time.Hour)
	case "7d":
		startDate = time.Now().Add(-7 * 24 * time.Hour)
	case "30d":
		startDate = time.Now().Add(-30 * 24 * time.Hour)
	default:
		startDate = time.Now().Add(-7 * 24 * time.Hour)
	}

	ctx := context.Background()

	// Total views
	totalViews, err := AnalyticsColl.CountDocuments(ctx, bson.M{"viewedAt": bson.M{"$gte": startDate}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	// Views by type
	viewsByType := make(map[string]int)
	typePipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"viewedAt": bson.M{"$gte": startDate}}}},
		{{Key: "$group", Value: bson.M{"_id": "$itemType", "count": bson.M{"$sum": 1}}}},
	}
	typeCursor, err := AnalyticsColl.Aggregate(ctx, typePipeline)
	if err == nil {
		defer typeCursor.Close(ctx)
		var results []struct {
			ID    string `bson:"_id"`
			Count int    `bson:"count"`
		}
		if typeCursor.All(ctx, &results) == nil {
			for _, r := range results {
				viewsByType[r.ID] = r.Count
			}
		}
	}

	// Views per day
	viewsPerDay := []gin.H{}
	dayPipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"viewedAt": bson.M{"$gte": startDate}}}},
		{{Key: "$group", Value: bson.M{
			"_id":   bson.M{"$dateToString": bson.M{"format": "%Y-%m-%d", "date": "$viewedAt"}},
			"count": bson.M{"$sum": 1},
		}}},
		{{Key: "$sort", Value: bson.M{"_id": 1}}},
	}
	dayCursor, err := AnalyticsColl.Aggregate(ctx, dayPipeline)
	if err == nil {
		defer dayCursor.Close(ctx)
		var results []struct {
			ID    string `bson:"_id"`
			Count int    `bson:"count"`
		}
		if dayCursor.All(ctx, &results) == nil {
			for _, r := range results {
				viewsPerDay = append(viewsPerDay, gin.H{"_id": r.ID, "count": r.Count})
			}
		}
	}

	// Device stats
	deviceStats := make(map[string]int)
	devicePipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"viewedAt": bson.M{"$gte": startDate}}}},
		{{Key: "$group", Value: bson.M{"_id": "$device", "count": bson.M{"$sum": 1}}}},
	}
	deviceCursor, err := AnalyticsColl.Aggregate(ctx, devicePipeline)
	if err == nil {
		defer deviceCursor.Close(ctx)
		var results []struct {
			ID    string `bson:"_id"`
			Count int    `bson:"count"`
		}
		if deviceCursor.All(ctx, &results) == nil {
			for _, r := range results {
				deviceStats[r.ID] = r.Count
			}
		}
	}

	// Country stats (unique visitors by IP per country)
	countryStats := make(map[string]int)
	countryPipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"viewedAt": bson.M{"$gte": startDate}, "ip": bson.M{"$exists": true, "$ne": "unknown"}}}},
		{{Key: "$group", Value: bson.M{"_id": bson.M{"country": "$country", "ip": "$ip"}}}},
		{{Key: "$group", Value: bson.M{"_id": "$_id.country", "count": bson.M{"$sum": 1}}}},
		{{Key: "$sort", Value: bson.M{"count": -1}}},
		{{Key: "$limit", Value: 10}},
	}
	countryCursor, err := AnalyticsColl.Aggregate(ctx, countryPipeline)
	if err == nil {
		defer countryCursor.Close(ctx)
		var results []struct {
			ID    string `bson:"_id"`
			Count int    `bson:"count"`
		}
		if countryCursor.All(ctx, &results) == nil {
			for _, r := range results {
				countryStats[r.ID] = r.Count
			}
		}
	}

	// Social stats
	socialStats := make(map[string]int)
	socialPipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"viewedAt": bson.M{"$gte": startDate}, "itemType": "Social"}}},
		{{Key: "$group", Value: bson.M{"_id": "$itemId", "count": bson.M{"$sum": 1}}}},
	}
	socialCursor, err := AnalyticsColl.Aggregate(ctx, socialPipeline)
	if err == nil {
		defer socialCursor.Close(ctx)
		var results []struct {
			ID    string `bson:"_id"`
			Count int    `bson:"count"`
		}
		if socialCursor.All(ctx, &results) == nil {
			for _, r := range results {
				socialStats[r.ID] = r.Count
			}
		}
	}

	// Social clicks by source
	socialClicksBySource := []gin.H{}
	sourcePipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"viewedAt":    bson.M{"$gte": startDate},
			"itemType":    "Social",
			"source.type": bson.M{"$exists": true},
		}}},
		{{Key: "$group", Value: bson.M{
			"_id": bson.M{
				"platform":   "$itemId",
				"sourceType": "$source.type",
				"sourceId":   "$source.id",
				"sourceName": "$source.name",
			},
			"count": bson.M{"$sum": 1},
		}}},
		{{Key: "$sort", Value: bson.M{"count": -1}}},
		{{Key: "$limit", Value: 20}},
	}
	sourceCursor, err := AnalyticsColl.Aggregate(ctx, sourcePipeline)
	if err == nil {
		defer sourceCursor.Close(ctx)
		var results []struct {
			ID struct {
				Platform   string              `bson:"platform"`
				SourceType string              `bson:"sourceType"`
				SourceID   *primitive.ObjectID `bson:"sourceId"`
				SourceName string              `bson:"sourceName"`
			} `bson:"_id"`
			Count int `bson:"count"`
		}
		if sourceCursor.All(ctx, &results) == nil {
			for _, r := range results {
				socialClicksBySource = append(socialClicksBySource, gin.H{
					"_id": gin.H{
						"platform":   r.ID.Platform,
						"sourceType": r.ID.SourceType,
						"sourceId":   r.ID.SourceID,
						"sourceName": r.ID.SourceName,
					},
					"count": r.Count,
				})
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"totalViews":           totalViews,
		"viewsByType":          viewsByType,
		"viewsPerDay":          viewsPerDay,
		"deviceStats":          deviceStats,
		"countryStats":         countryStats,
		"socialStats":          socialStats,
		"socialClicksBySource": socialClicksBySource,
		"period":               period,
	})
}

func GetAllItemsViewsHandler(c *gin.Context) {
	period := c.DefaultQuery("period", "7d")

	var startDate time.Time
	if period == "all" {
		startDate = time.Unix(0, 0)
	} else {
		switch period {
		case "24h":
			startDate = time.Now().Add(-24 * time.Hour)
		case "7d":
			startDate = time.Now().Add(-7 * 24 * time.Hour)
		case "30d":
			startDate = time.Now().Add(-30 * 24 * time.Hour)
		default:
			startDate = time.Now().Add(-7 * 24 * time.Hour)
		}
	}

	ctx := context.Background()

	// Get views breakdown
	viewsMap := make(map[string]int)
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"viewedAt": bson.M{"$gte": startDate}}}},
		{{Key: "$group", Value: bson.M{
			"_id":   bson.M{"itemId": "$itemId", "itemType": "$itemType"},
			"views": bson.M{"$sum": 1},
		}}},
	}

	cursor, err := AnalyticsColl.Aggregate(ctx, pipeline)
	if err == nil {
		defer cursor.Close(ctx)
		var results []struct {
			ID struct {
				ItemID   interface{} `bson:"itemId"`
				ItemType string      `bson:"itemType"`
			} `bson:"_id"`
			Views int `bson:"views"`
		}
		if cursor.All(ctx, &results) == nil {
			for _, r := range results {
				// Convert ItemID key to string
				var idStr string
				if objID, ok := r.ID.ItemID.(primitive.ObjectID); ok {
					idStr = objID.Hex()
				} else if s, ok := r.ID.ItemID.(string); ok {
					idStr = s
				}
				if idStr != "" {
					viewsMap[r.ID.ItemType+"-"+idStr] = r.Views
				}
			}
		}
	}

	// Fetch Tours
	tourCursor, err := ToursCollection.Find(ctx, bson.M{"status": "active"})
	var tours []Tour
	if err == nil {
		defer tourCursor.Close(ctx)
		_ = tourCursor.All(ctx, &tours)
	}

	// Fetch Aviatury
	aviaturCursor, err := AviaturyCollection.Find(ctx, bson.M{"status": "active"})
	var aviatury []Aviatur
	if err == nil {
		defer aviaturCursor.Close(ctx)
		_ = aviaturCursor.All(ctx, &aviatury)
	}

	type ItemResponse struct {
		ID        string    `json:"_id"`
		Title     string    `json:"title"`
		City      string    `json:"city,omitempty"`
		Country   string    `json:"country"`
		Flag      string    `json:"flag,omitempty"`
		Image     string    `json:"image,omitempty"`
		Images    []string  `json:"images,omitempty"`
		Price     float64   `json:"price"`
		StartDate time.Time `json:"startDate,omitempty"`
		ItemType  string    `json:"itemType"`
		Views     int       `json:"views"`
	}

	toursResponse := []ItemResponse{}
	for _, t := range tours {
		toursResponse = append(toursResponse, ItemResponse{
			ID:        t.ID.Hex(),
			Title:     t.Title,
			City:      t.City,
			Country:   t.Country,
			Images:    t.Images,
			Price:     t.Price,
			StartDate: t.StartDate,
			ItemType:  "Tour",
			Views:     viewsMap["Tour-"+t.ID.Hex()],
		})
	}

	aviaturyResponse := []ItemResponse{}
	for _, a := range aviatury {
		aviaturyResponse = append(aviaturyResponse, ItemResponse{
			ID:       a.ID.Hex(),
			Title:    a.Title,
			Country:  a.Country,
			Flag:     a.Flag,
			Image:    a.Image,
			Price:    a.Price,
			ItemType: "Aviatur",
			Views:    viewsMap["Aviatur-"+a.ID.Hex()],
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"tours":     toursResponse,
		"aviatury":  aviaturyResponse,
		"period":    period,
	})
}
