package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
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

func UploadHandler(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Файл не знайдено в запиті"})
		return
	}

	// Limit size to 8MB
	if file.Size > 8*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Файл занадто великий. Максимум 8MB"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowed := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".gif":  true,
	}
	if !allowed[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Непідтримуваний формат файлу"})
		return
	}

	uploadsDir := "../uploads"
	if err := os.MkdirAll(uploadsDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка сервера при створенні папки завантаження"})
		return
	}

	safeBase := sanitizeFilename(strings.TrimSuffix(file.Filename, ext))
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano()/int64(time.Millisecond), safeBase, ext)
	savePath := filepath.Join(uploadsDir, filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Помилка завантаження", "error": err.Error()})
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
