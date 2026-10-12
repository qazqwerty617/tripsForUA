package main

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	_ "image/gif"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/image/webp"
)

func sanitizeFilename(s string) string {
	var sb strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '_' || r == '-' {
			sb.WriteRune(r)
		} else {
			sb.WriteRune('_')
		}
	}
	return sb.String()
}

// convertToJPEG takes raw image bytes and content-type, returns JPEG bytes
func convertToJPEG(data []byte, contentType string) ([]byte, error) {
	var img image.Image
	var err error

	reader := bytes.NewReader(data)
	ct := strings.ToLower(contentType)

	if strings.Contains(ct, "webp") {
		img, err = webp.Decode(reader)
	} else if strings.Contains(ct, "png") {
		img, err = png.Decode(reader)
	} else if strings.Contains(ct, "jpeg") || strings.Contains(ct, "jpg") {
		// Already JPEG — just re-encode with our quality setting
		img, err = jpeg.Decode(reader)
	} else {
		// Try generic decode
		img, _, err = image.Decode(reader)
	}

	if err != nil {
		return nil, fmt.Errorf("decode error: %w", err)
	}

	var buf bytes.Buffer
	if encErr := jpeg.Encode(&buf, img, &jpeg.Options{Quality: 85}); encErr != nil {
		return nil, fmt.Errorf("jpeg encode error: %w", encErr)
	}
	return buf.Bytes(), nil
}

func saveImageAndRespond(c *gin.Context, imgBytes []byte, baseName string) {
	uploadsDir := "../uploads"
	if err := os.MkdirAll(uploadsDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера при створенні папки завантаження"})
		return
	}

	filename := fmt.Sprintf("%d_%s.jpg", time.Now().UnixNano()/int64(time.Millisecond), sanitizeFilename(baseName))
	savePath := fmt.Sprintf("%s/%s", uploadsDir, filename)

	if err := os.WriteFile(savePath, imgBytes, 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка збереження файлу", "error": err.Error()})
		return
	}

	urlPath := "/uploads/" + filename

	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	if proto := c.GetHeader("X-Forwarded-Proto"); proto != "" {
		scheme = proto
	}
	fullUrl := fmt.Sprintf("%s://%s%s", scheme, c.Request.Host, urlPath)

	c.JSON(http.StatusOK, gin.H{
		"path":     urlPath,
		"url":      fullUrl,
		"filename": filename,
	})
}

// UploadHandler — receives a file, converts to JPEG, saves it
func UploadHandler(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Файл не знайдено в запиті"})
		return
	}

	if file.Size > 20*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Файл занадто великий. Максимум 20MB"})
		return
	}

	ext := strings.ToLower(strings.TrimPrefix(fmt.Sprintf("%s", file.Header.Get("Content-Type")), "image/"))
	allowed := map[string]bool{
		"jpg": true, "jpeg": true, "png": true, "webp": true, "gif": true,
	}
	// Also check by file extension
	fileExt := strings.ToLower(fmt.Sprintf("%s", file.Filename))
	extOnly := ""
	if idx := strings.LastIndex(fileExt, "."); idx >= 0 {
		extOnly = fileExt[idx+1:]
	}
	if !allowed[ext] && !allowed[extOnly] {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Непідтримуваний формат файлу. Допустимі: JPG, PNG, WebP, GIF"})
		return
	}

	f, openErr := file.Open()
	if openErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка відкриття файлу"})
		return
	}
	defer f.Close()

	rawData, readErr := io.ReadAll(f)
	if readErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка читання файлу"})
		return
	}

	contentType := file.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "image/jpeg"
	}

	jpegData, convErr := convertToJPEG(rawData, contentType)
	if convErr != nil {
		// If conversion fails, save original
		jpegData = rawData
	}

	baseName := strings.TrimSuffix(file.Filename, fmt.Sprintf(".%s", extOnly))
	saveImageAndRespond(c, jpegData, sanitizeFilename(baseName))
}

// ImportImageHandler — receives a URL (Google, Pinterest, etc.), downloads and converts to JPEG
func ImportImageHandler(c *gin.Context) {
	var body struct {
		URL string `json:"url"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.URL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Вкажіть URL зображення"})
		return
	}

	imgURL := body.URL

	// Normalize Pinterest URL
	if strings.Contains(imgURL, "pinimg.com") || strings.Contains(imgURL, "pinterest.com") {
		// Pinterest often redirects — we just pass it through with proper headers
	}

	// Create HTTP client with proper headers to bypass hotlink protection
	client := &http.Client{
		Timeout: 30 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 10 {
				return fmt.Errorf("too many redirects")
			}
			// Copy headers for redirects
			req.Header.Set("User-Agent", via[0].Header.Get("User-Agent"))
			req.Header.Set("Referer", via[0].Header.Get("Referer"))
			return nil
		},
	}

	req, reqErr := http.NewRequest("GET", imgURL, nil)
	if reqErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Невірний URL"})
		return
	}

	// Set headers to look like a browser (bypasses many hotlink protections)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8")
	req.Header.Set("Accept-Language", "uk-UA,uk;q=0.9,en;q=0.8")
	req.Header.Set("Referer", "https://www.google.com/")

	resp, fetchErr := client.Do(req)
	if fetchErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Не вдалося завантажити зображення", "error": fetchErr.Error()})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadRequest, gin.H{"message": fmt.Sprintf("Помилка завантаження: HTTP %d", resp.StatusCode)})
		return
	}

	contentType := resp.Header.Get("Content-Type")

	// Limit download to 30MB
	limitedReader := io.LimitReader(resp.Body, 30*1024*1024)
	rawData, readErr := io.ReadAll(limitedReader)
	if readErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка читання зображення"})
		return
	}

	if len(rawData) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Зображення порожнє або недоступне"})
		return
	}

	// Detect content type if not provided
	if contentType == "" || contentType == "application/octet-stream" {
		contentType = http.DetectContentType(rawData)
	}

	// Check it's actually an image
	if !strings.HasPrefix(contentType, "image/") {
		// Try to detect from URL extension
		urlLower := strings.ToLower(imgURL)
		if strings.Contains(urlLower, ".jpg") || strings.Contains(urlLower, ".jpeg") {
			contentType = "image/jpeg"
		} else if strings.Contains(urlLower, ".png") {
			contentType = "image/png"
		} else if strings.Contains(urlLower, ".webp") {
			contentType = "image/webp"
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"message": "URL не є зображенням"})
			return
		}
	}

	jpegData, convErr := convertToJPEG(rawData, contentType)
	if convErr != nil {
		// If we can't convert, try saving raw as-is (might be a valid JPEG already)
		jpegData = rawData
	}

	// Create a base name from URL
	parts := strings.Split(imgURL, "/")
	baseName := "imported"
	if len(parts) > 0 {
		last := parts[len(parts)-1]
		if idx := strings.Index(last, "?"); idx > 0 {
			last = last[:idx]
		}
		if last != "" {
			baseName = last
		}
	}
	// Remove extension from base name
	if idx := strings.LastIndex(baseName, "."); idx > 0 {
		baseName = baseName[:idx]
	}

	saveImageAndRespond(c, jpegData, sanitizeFilename(baseName))
}
