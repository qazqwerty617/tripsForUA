package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"image/png"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/qr"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/pquerna/otp/totp"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type JWTClaims struct {
	ID string `json:"id"`
	jwt.RegisteredClaims
}

func GenerateToken(userID string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "my_super_secret_key_2024_change_in_production"
	}

	claims := JWTClaims{
		ID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * 24 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func Protect() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Не авторизовано, токен відсутній"})
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			secret = "my_super_secret_key_2024_change_in_production"
		}

		claims := &JWTClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Не авторизовано, невірний токен"})
			c.Abort()
			return
		}

		objID, err := primitive.ObjectIDFromHex(claims.ID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Не авторизовано, невірний токен"})
			c.Abort()
			return
		}

		var user User
		err = UsersCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Не авторизовано, користувача не знайдено"})
			c.Abort()
			return
		}

		c.Set("user", user)
		c.Next()
	}
}

func Admin() gin.HandlerFunc {
	return func(c *gin.Context) {
		userVal, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"message": "Доступ заборонено"})
			c.Abort()
			return
		}

		user := userVal.(User)
		if user.Role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"message": "Доступ заборонено. Потрібні права адміністратора"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func generateQRCodeDataURL(url string) (string, error) {
	qrCode, err := qr.Encode(url, qr.M, qr.Auto)
	if err != nil {
		return "", err
	}

	qrCode, err = barcode.Scale(qrCode, 200, 200)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	err = png.Encode(&buf, qrCode)
	if err != nil {
		return "", err
	}

	return "data:image/png;base64," + base64.StdEncoding.EncodeToString(buf.Bytes()), nil
}

// Route Handlers

func RegisterHandler(c *gin.Context) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:"name"`
		Phone    string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний формат запиту"})
		return
	}

	body.Email = strings.ToLower(strings.TrimSpace(body.Email))

	// Check if user exists
	count, err := UsersCollection.CountDocuments(context.Background(), bson.M{"email": body.Email})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Користувач з таким email вже існує"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	newUser := User{
		ID:               primitive.NewObjectID(),
		Email:            body.Email,
		Password:         string(hashedPassword),
		Name:             body.Name,
		Phone:            body.Phone,
		Role:             "user",
		TwoFactorEnabled: false,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	_, err = UsersCollection.InsertOne(context.Background(), newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	token, _ := GenerateToken(newUser.ID.Hex())

	c.JSON(http.StatusCreated, gin.H{
		"_id":   newUser.ID.Hex(),
		"name":  newUser.Name,
		"email": newUser.Email,
		"role":  newUser.Role,
		"token": token,
	})
}

func LoginHandler(c *gin.Context) {
	var body struct {
		Email          string `json:"email"`
		Password       string `json:"password"`
		TwoFactorCode  string `json:"twoFactorCode"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний формат запиту"})
		return
	}

	body.Email = strings.ToLower(strings.TrimSpace(body.Email))

	var user User
	err := UsersCollection.FindOne(context.Background(), bson.M{"email": body.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Невірний email або пароль"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Невірний email або пароль"})
		return
	}

	// 2FA check
	if user.TwoFactorEnabled {
		if body.TwoFactorCode == "" {
			c.JSON(http.StatusOK, gin.H{
				"requires2FA": true,
				"message":     "Потрібен код двофакторної автентифікації",
			})
			return
		}

		// Verify 2FA
		valid := totp.Validate(body.TwoFactorCode, user.TwoFactorSecret)
		if !valid {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Невірний код 2FA"})
			return
		}
	}

	token, _ := GenerateToken(user.ID.Hex())

	c.JSON(http.StatusOK, gin.H{
		"_id":              user.ID.Hex(),
		"name":             user.Name,
		"email":            user.Email,
		"role":             user.Role,
		"twoFactorEnabled": user.TwoFactorEnabled,
		"token":            token,
	})
}

func MeHandler(c *gin.Context) {
	userVal, _ := c.Get("user")
	user := userVal.(User)
	user.Password = ""
	user.TwoFactorSecret = ""
	user.TwoFactorTempSecret = ""
	c.JSON(http.StatusOK, user)
}

func Setup2FAHandler(c *gin.Context) {
	userVal, _ := c.Get("user")
	user := userVal.(User)

	if user.TwoFactorEnabled {
		c.JSON(http.StatusBadRequest, gin.H{"message": "2FA вже увімкнено"})
		return
	}

	secret, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "TripsForUA",
		AccountName: user.Email,
		Period:      30,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка генерації 2FA", "error": err.Error()})
		return
	}

	// Save temporary secret
	_, err = UsersCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": user.ID},
		bson.M{"$set": bson.M{"twoFactorTempSecret": secret.Secret()}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	qrCodeUrl, err := generateQRCodeDataURL(secret.URL())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка генерації QR-коду", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"secret": secret.Secret(),
		"qrCode": qrCodeUrl,
	})
}

func Verify2FAHandler(c *gin.Context) {
	var body struct {
		Token string `json:"token"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний формат запиту"})
		return
	}

	userVal, _ := c.Get("user")
	user := userVal.(User)

	if user.TwoFactorTempSecret == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Спочатку налаштуйте 2FA"})
		return
	}

	valid := totp.Validate(body.Token, user.TwoFactorTempSecret)
	if !valid {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Невірний код. Спробуйте ще раз."})
		return
	}

	_, err := UsersCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": user.ID},
		bson.M{
			"$set": bson.M{
				"twoFactorSecret":     user.TwoFactorTempSecret,
				"twoFactorTempSecret": "",
				"twoFactorEnabled":    true,
			},
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "2FA успішно увімкнено!"})
}

func Disable2FAHandler(c *gin.Context) {
	var body struct {
		Token string `json:"token"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неправильний формат запиту"})
		return
	}

	userVal, _ := c.Get("user")
	user := userVal.(User)

	if !user.TwoFactorEnabled {
		c.JSON(http.StatusBadRequest, gin.H{"message": "2FA не увімкнено"})
		return
	}

	valid := totp.Validate(body.Token, user.TwoFactorSecret)
	if !valid {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Невірний код 2FA"})
		return
	}

	_, err := UsersCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": user.ID},
		bson.M{
			"$set": bson.M{
				"twoFactorSecret":  "",
				"twoFactorEnabled": false,
			},
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "2FA вимкнено"})
}

func Status2FAHandler(c *gin.Context) {
	userVal, _ := c.Get("user")
	user := userVal.(User)
	c.JSON(http.StatusOK, gin.H{"enabled": user.TwoFactorEnabled})
}
