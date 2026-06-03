package main

import (
	"encoding/json"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Email               string             `bson:"email" json:"email"`
	Password            string             `bson:"password" json:"password,omitempty"`
	Name                string             `bson:"name" json:"name"`
	Role                string             `bson:"role" json:"role"`
	Phone               string             `bson:"phone" json:"phone"`
	TwoFactorEnabled    bool               `bson:"twoFactorEnabled" json:"twoFactorEnabled"`
	TwoFactorSecret     string             `bson:"twoFactorSecret" json:"twoFactorSecret,omitempty"`
	TwoFactorTempSecret string             `bson:"twoFactorTempSecret" json:"twoFactorTempSecret,omitempty"`
	CreatedAt           time.Time          `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt           time.Time          `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

type Destination struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name             string             `bson:"name" json:"name"`
	NameUk           string             `bson:"nameUk" json:"nameUk"`
	Country          string             `bson:"country" json:"country"`
	Flag             string             `bson:"flag" json:"flag"`
	Slug             string             `bson:"slug" json:"slug"`
	Description      string             `bson:"description" json:"description"`
	ShortDescription string             `bson:"shortDescription" json:"shortDescription"`
	Image            string             `bson:"image" json:"image"`
	Gallery          []string           `bson:"gallery" json:"gallery"`
	Continent        string             `bson:"continent" json:"continent"`
	Featured         bool               `bson:"featured" json:"featured"`
	PopularityScore  float64            `bson:"popularityScore" json:"popularityScore"`
	CreatedAt        time.Time          `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt        time.Time          `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

type ItineraryItem struct {
	Day         int    `bson:"day" json:"day"`
	Title       string `bson:"title" json:"title"`
	Description string `bson:"description" json:"description"`
}

type Tour struct {
	ID              primitive.ObjectID   `bson:"_id,omitempty" json:"_id"`
	Destination     *primitive.ObjectID  `bson:"destination,omitempty" json:"destination,omitempty"`
	DestinationData *Destination         `bson:"-" json:"destination,omitempty"` // Populate on load
	Country         string               `bson:"country" json:"country"`
	City            string               `bson:"city" json:"city"`
	Title           string               `bson:"title" json:"title"`
	FancyTitle      string               `bson:"fancyTitle" json:"fancyTitle"`
	Description     string               `bson:"description" json:"description"`
	ShortDescription string              `bson:"shortDescription" json:"shortDescription"`
	Price           float64              `bson:"price" json:"price"`
	OriginalPrice   *float64             `bson:"originalPrice,omitempty" json:"originalPrice,omitempty"`
	Duration        string               `bson:"duration" json:"duration"`
	StartDate       time.Time            `bson:"startDate" json:"startDate"`
	EndDate         time.Time            `bson:"endDate" json:"endDate"`
	AvailableDates  []time.Time          `bson:"availableDates" json:"availableDates"`
	MaxParticipants int                  `bson:"maxParticipants" json:"maxParticipants"`
	AvailableSpots  int                  `bson:"availableSpots" json:"availableSpots"`
	Images          []string             `bson:"images" json:"images"`
	Highlights      []string             `bson:"highlights" json:"highlights"`
	Included        []string             `bson:"included" json:"included"`
	NotIncluded     []string             `bson:"notIncluded" json:"notIncluded"`
	Itinerary       []ItineraryItem      `bson:"itinerary" json:"itinerary"`
	Featured        bool                 `bson:"featured" json:"featured"`
	Status          string               `bson:"status" json:"status"`
	TourType        string               `bson:"tourType" json:"tourType"`
	ContactTelegram string               `bson:"contactTelegram" json:"contactTelegram"`
	ContactInstagram string              `bson:"contactInstagram" json:"contactInstagram"`
	PriceUnit       string               `bson:"priceUnit" json:"priceUnit"`
	TourBasis       string               `bson:"tourBasis" json:"tourBasis"`
	Order           int                  `bson:"order" json:"order"`
	CreatedAt       time.Time            `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt       time.Time            `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

func (t *Tour) UnmarshalJSON(data []byte) error {
	type Alias Tour
	aux := &struct {
		StartDate      interface{}   `json:"startDate"`
		EndDate        interface{}   `json:"endDate"`
		AvailableDates []interface{} `json:"availableDates"`
		*Alias
	}{
		Alias: (*Alias)(t),
	}
	if err := json.Unmarshal(data, aux); err != nil {
		return err
	}

	parseDate := func(val interface{}) (time.Time, error) {
		if val == nil {
			return time.Time{}, nil
		}
		strVal, ok := val.(string)
		if !ok || strVal == "" {
			return time.Time{}, nil
		}
		if parsedTime, parseErr := time.Parse(time.RFC3339, strVal); parseErr == nil {
			return parsedTime, nil
		}
		if parsedTime, parseErr := time.Parse("2006-01-02", strVal); parseErr == nil {
			return parsedTime, nil
		}
		return time.Time{}, fmt.Errorf("invalid date format: %v", val)
	}

	var err error
	if aux.StartDate != nil {
		t.StartDate, err = parseDate(aux.StartDate)
		if err != nil {
			return err
		}
	}
	if aux.EndDate != nil {
		t.EndDate, err = parseDate(aux.EndDate)
		if err != nil {
			return err
		}
	}
	if aux.AvailableDates != nil {
		t.AvailableDates = make([]time.Time, 0, len(aux.AvailableDates))
		for _, dVal := range aux.AvailableDates {
			d, err := parseDate(dVal)
			if err != nil {
				return err
			}
			t.AvailableDates = append(t.AvailableDates, d)
		}
	}

	return nil
}

type Booking struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Tour           primitive.ObjectID `bson:"tour" json:"tour"`
	TourData       *Tour              `bson:"-" json:"tour,omitempty"` // Populate on load
	CustomerName   string             `bson:"customerName" json:"customerName"`
	CustomerEmail  string             `bson:"customerEmail" json:"customerEmail"`
	CustomerPhone  string             `bson:"customerPhone" json:"customerPhone"`
	NumberOfPeople int                `bson:"numberOfPeople" json:"numberOfPeople"`
	TotalPrice     float64            `bson:"totalPrice" json:"totalPrice"`
	Status         string             `bson:"status" json:"status"`
	Notes          string             `bson:"notes" json:"notes"`
	PaymentStatus  string             `bson:"paymentStatus" json:"paymentStatus"`
	CreatedAt      time.Time          `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt      time.Time          `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

type Aviatur struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name          string             `bson:"name" json:"name"`
	Country       string             `bson:"country" json:"country"`
	Flag          string             `bson:"flag" json:"flag"`
	Description   string             `bson:"description" json:"description"`
	Price         float64            `bson:"price" json:"price"`
	OriginalPrice *float64           `bson:"originalPrice,omitempty" json:"originalPrice,omitempty"`
	Title         string             `bson:"title" json:"title"`
	Hot           bool               `bson:"hot" json:"hot"`
	Duration      string             `bson:"duration" json:"duration"`
	Nights        int                `bson:"nights" json:"nights"`
	Image         string             `bson:"image" json:"image"`
	AvailableFrom time.Time          `bson:"availableFrom" json:"availableFrom"`
	AvailableTo   time.Time          `bson:"availableTo" json:"availableTo"`
	Included      []string           `bson:"included" json:"included"`
	NotIncluded   []string           `bson:"notIncluded" json:"notIncluded"`
	IsResort      bool               `bson:"isResort" json:"isResort"`
	Order         int                `bson:"order" json:"order"`
	Status        string             `bson:"status" json:"status"`
	CreatedAt     time.Time          `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt     time.Time          `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

func (a *Aviatur) UnmarshalJSON(data []byte) error {
	type Alias Aviatur
	aux := &struct {
		AvailableFrom interface{} `json:"availableFrom"`
		AvailableTo   interface{} `json:"availableTo"`
		*Alias
	}{
		Alias: (*Alias)(a),
	}
	if err := json.Unmarshal(data, aux); err != nil {
		return err
	}

	parseDate := func(val interface{}) (time.Time, error) {
		if val == nil {
			return time.Time{}, nil
		}
		strVal, ok := val.(string)
		if !ok || strVal == "" {
			return time.Time{}, nil
		}
		if parsedTime, parseErr := time.Parse(time.RFC3339, strVal); parseErr == nil {
			return parsedTime, nil
		}
		if parsedTime, parseErr := time.Parse("2006-01-02", strVal); parseErr == nil {
			return parsedTime, nil
		}
		return time.Time{}, fmt.Errorf("invalid date format: %v", val)
	}

	var err error
	if aux.AvailableFrom != nil {
		a.AvailableFrom, err = parseDate(aux.AvailableFrom)
		if err != nil {
			return err
		}
	}
	if aux.AvailableTo != nil {
		a.AvailableTo, err = parseDate(aux.AvailableTo)
		if err != nil {
			return err
		}
	}

	return nil
}

type AnalyticsSource struct {
	Type string              `bson:"type" json:"type"` // 'Tour', 'Aviatur', 'General'
	ID   *primitive.ObjectID `bson:"id,omitempty" json:"id,omitempty"`
	Name string              `bson:"name,omitempty" json:"name,omitempty"`
}

type Analytics struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	ItemID    interface{}        `bson:"itemId" json:"itemId"` // Can be primitive.ObjectID or string
	ItemType  string             `bson:"itemType" json:"itemType"`
	Source    *AnalyticsSource   `bson:"source,omitempty" json:"source,omitempty"`
	ViewedAt  time.Time          `bson:"viewedAt" json:"viewedAt"`
	UserAgent string             `bson:"userAgent" json:"userAgent"`
	Device    string             `bson:"device" json:"device"`
	Country   string             `bson:"country" json:"country"`
	IP        string             `bson:"ip" json:"ip"`
	CreatedAt time.Time          `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt time.Time          `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}
