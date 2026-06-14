package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var indexHtml string

func LoadIndexHTML() {
	distPath := "../client/dist/index.html"
	bytes, err := os.ReadFile(distPath)
	if err == nil {
		indexHtml = string(bytes)
		log.Println("✅ Production index.html loaded successfully for SEO")
	} else {
		log.Printf("⚠️ Could not load production index.html from %s: %v", distPath, err)
	}
}

func getDomainAndScheme(c *gin.Context) string {
	domain := os.Getenv("DOMAIN_NAME")
	if domain == "" {
		scheme := "https"
		if c.Request.TLS == nil {
			scheme = "http"
		}
		if proto := c.GetHeader("X-Forwarded-Proto"); proto != "" {
			scheme = proto
		}
		domain = scheme + "://" + c.Request.Host
	} else {
		if !strings.HasPrefix(domain, "http://") && !strings.HasPrefix(domain, "https://") {
			domain = "https://" + domain
		}
	}
	return strings.TrimSuffix(domain, "/")
}

func HandleSEORoute() gin.HandlerFunc {
	titleRegex := regexp.MustCompile(`<title>[\s\S]*?<\/title>`)
	descRegex := regexp.MustCompile(`<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>`)
	ogTitleRegex := regexp.MustCompile(`<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>`)
	ogDescRegex := regexp.MustCompile(`<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>`)
	ogImageRegex := regexp.MustCompile(`<meta\s+property="og:image"\s+content="[\s\S]*?"\s*\/?>`)
	canonicalRegex := regexp.MustCompile(`<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/?>`)

	return func(c *gin.Context) {
		if indexHtml == "" {
			c.File("../client/dist/index.html")
			return
		}

		domain := getDomainAndScheme(c)
		currentURL := domain + c.Request.URL.Path

		id := c.Param("id")
		slug := c.Param("slug")

		title := "Trips for Ukraine - Авторські тури по всьому світу"
		description := "Понад 30 ексклюзивних напрямків: від Мадагаскару до Японії. 15000+ клієнтів. Довіра - наше все. Більше 6 років на ринку, найбільша аудиторія в Україні."
		image := domain + "/og-image.jpg"
		schemaJSON := ""

		ctx := context.Background()

		if id != "" {
			objID, err := primitive.ObjectIDFromHex(id)
			if err == nil {
				var tour Tour
				if ToursCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&tour) == nil {
					title = tour.Title + " | Trips for Ukraine"
					if tour.ShortDescription != "" {
						description = tour.ShortDescription
					} else if len(tour.Description) > 160 {
						description = tour.Description[:160] + "..."
					} else {
						description = tour.Description
					}
					if len(tour.Images) > 0 {
						image = tour.Images[0]
					}

					// Dynamic Tour Schema
					schemaJSON = fmt.Sprintf(`{
						"@context": "https://schema.org",
						"@type": "Product",
						"name": %q,
						"description": %q,
						"image": %q,
						"offers": {
							"@type": "Offer",
							"price": "%.2f",
							"priceCurrency": "EUR",
							"availability": "https://schema.org/InStock",
							"url": %q
						}
					}`, tour.Title, description, image, tour.Price, currentURL)
				}
			}
		} else if slug != "" {
			var dest Destination
			if DestCollection.FindOne(ctx, bson.M{"slug": slug}).Decode(&dest) == nil {
				title = dest.NameUk + " | Напрямки | Trips for Ukraine"
				descText := "Відкрийте для себе " + dest.NameUk + " з Trips for Ukraine. " + dest.Description
				if len(descText) > 160 {
					description = descText[:157] + "..."
				} else {
					description = descText
				}
				if dest.Image != "" {
					image = dest.Image
				}

				// Dynamic Place Schema
				schemaJSON = fmt.Sprintf(`{
					"@context": "https://schema.org",
					"@type": "TouristDestination",
					"name": %q,
					"description": %q,
					"image": %q
				}`, dest.NameUk, description, image)
			}
		} else if c.Request.URL.Path == "/destinations" {
			title = "Ексклюзивні туристичні напрямки | Trips for Ukraine"
			description = "Подорожуйте світом з Trips for Ukraine. Ексклюзивні авторські тури, перевірені маршрути: Мадагаскар, Японія, Норвегія, Перу та багато інших країн."

			schemaJSON = fmt.Sprintf(`{
				"@context": "https://schema.org",
				"@type": "WebPage",
				"name": "Напрямки подорожей",
				"description": %q,
				"url": %q
			}`, description, currentURL)
		} else {
			// Homepage
			schemaJSON = fmt.Sprintf(`{
				"@context": "https://schema.org",
				"@type": "TravelAgency",
				"name": "Trips for Ukraine",
				"description": %q,
				"url": %q,
				"image": %q,
				"priceRange": "$$$"
			}`, description, domain, image)
		}

		html := indexHtml
		html = titleRegex.ReplaceAllString(html, "<title>"+title+"</title>")
		html = descRegex.ReplaceAllString(html, "<meta name=\"description\" content=\""+description+"\" />")
		html = ogTitleRegex.ReplaceAllString(html, "<meta property=\"og:title\" content=\""+title+"\" />")
		html = ogDescRegex.ReplaceAllString(html, "<meta property=\"og:description\" content=\""+description+"\" />")
		html = ogImageRegex.ReplaceAllString(html, "<meta property=\"og:image\" content=\""+image+"\" />")

		// Replace canonical URL
		canonicalTag := fmt.Sprintf(`<link rel="canonical" href="%s" />`, currentURL)
		if canonicalRegex.MatchString(html) {
			html = canonicalRegex.ReplaceAllString(html, canonicalTag)
		} else {
			html = strings.Replace(html, "</head>", "  "+canonicalTag+"\n</head>", 1)
		}

		// Inject JSON-LD structured data
		if schemaJSON != "" {
			scriptBlock := "\n  <script type=\"application/ld+json\">\n  " + schemaJSON + "\n  </script>\n</head>"
			html = strings.Replace(html, "</head>", scriptBlock, 1)
		}

		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
	}
}

func HandleSitemapRoute() gin.HandlerFunc {
	return func(c *gin.Context) {
		domain := getDomainAndScheme(c)

		ctx := context.Background()

		// 1. Fetch active tours
		var tours []Tour
		cursor, err := ToursCollection.Find(ctx, bson.M{"status": "active"})
		if err == nil {
			cursor.All(ctx, &tours)
		}

		// 2. Fetch destinations
		var dests []Destination
		cursorDest, err := DestCollection.Find(ctx, bson.M{})
		if err == nil {
			cursorDest.All(ctx, &dests)
		}

		var sb strings.Builder
		sb.WriteString(`<?xml version="1.0" encoding="UTF-8"?>` + "\n")
		sb.WriteString(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` + "\n")

		// Home page
		sb.WriteString(fmt.Sprintf("  <url>\n    <loc>%s/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n", domain))

		// Destinations list
		sb.WriteString(fmt.Sprintf("  <url>\n    <loc>%s/destinations</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n", domain))

		// Active tours
		for _, tour := range tours {
			sb.WriteString(fmt.Sprintf("  <url>\n    <loc>%s/tours/%s</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n", domain, tour.ID.Hex()))
		}

		// Destinations detail
		for _, dest := range dests {
			if dest.Slug != "" {
				sb.WriteString(fmt.Sprintf("  <url>\n    <loc>%s/destinations/%s</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n", domain, dest.Slug))
			}
		}

		sb.WriteString("</urlset>\n")

		c.Header("Content-Type", "application/xml; charset=utf-8")
		c.String(http.StatusOK, sb.String())
	}
}

func HandleRobotsRoute() gin.HandlerFunc {
	return func(c *gin.Context) {
		domain := getDomainAndScheme(c)

		robots := fmt.Sprintf(`User-agent: *
Allow: /
Disallow: /mng-x7k9p2-secure/
Disallow: /api/auth
Disallow: /api/upload

Sitemap: %s/sitemap.xml
`, domain)

		c.Header("Content-Type", "text/plain; charset=utf-8")
		c.String(http.StatusOK, robots)
	}
}

func ServeStaticOrIndex() gin.HandlerFunc {
	distPath := "../client/dist"
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") || strings.HasPrefix(path, "/uploads") {
			c.Next()
			return
		}

		localFile := filepath.Join(distPath, path)
		info, err := os.Stat(localFile)
		if err == nil && !info.IsDir() {
			c.File(localFile)
			c.Abort()
			return
		}

		c.File(filepath.Join(distPath, "index.html"))
		c.Abort()
	}
}

func main() {
	// Load .env from root workspace folder
	err := godotenv.Load("../.env")
	if err != nil {
		log.Println("ℹ️ No .env file found in parent directory, using system env variables")
	}

	InitDB()

	isProduction := os.Getenv("NODE_ENV") == "production"

	if isProduction {
		gin.SetMode(gin.ReleaseMode)
		LoadIndexHTML()
	}

	r := gin.Default()

	// CORS config
	corsOrigins := os.Getenv("CORS_ORIGINS")
	var allowedOrigins []string
	if corsOrigins != "" {
		allowedOrigins = strings.Split(corsOrigins, ",")
		for i, origin := range allowedOrigins {
			allowedOrigins[i] = strings.TrimSpace(origin)
		}
	}

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowCredentials = true
	if len(allowedOrigins) > 0 {
		corsConfig.AllowOrigins = allowedOrigins
	} else {
		corsConfig.AllowAllOrigins = true
	}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(corsConfig))

	// Static Uploads route
	r.Static("/uploads", "../uploads")

	// API Routes Group
	api := r.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", RegisterHandler)
			auth.POST("/login", LoginHandler)
			auth.GET("/me", Protect(), MeHandler)
			auth.POST("/2fa/setup", Protect(), Setup2FAHandler)
			auth.POST("/2fa/verify", Protect(), Verify2FAHandler)
			auth.POST("/2fa/disable", Protect(), Disable2FAHandler)
			auth.GET("/2fa/status", Protect(), Status2FAHandler)
		}

		// Tours routes
		tours := api.Group("/tours")
		{
			tours.GET("", GetToursHandler)
			tours.GET("/:id", GetTourByIDHandler)
			tours.POST("", Protect(), Admin(), CreateTourHandler)
			tours.PUT("/reorder", Protect(), Admin(), ReorderToursHandler)
			tours.PUT("/:id", Protect(), Admin(), UpdateTourHandler)
			tours.DELETE("/:id", Protect(), Admin(), DeleteTourHandler)
		}

		// Destinations routes
		destinations := api.Group("/destinations")
		{
			destinations.GET("", GetDestinationsHandler)
			destinations.GET("/:slug", GetDestinationBySlugHandler)
			destinations.POST("", Protect(), Admin(), CreateDestinationHandler)
			destinations.PUT("/:id", Protect(), Admin(), UpdateDestinationHandler)
			destinations.DELETE("/:id", Protect(), Admin(), DeleteDestinationHandler)
		}

		// Bookings routes
		bookings := api.Group("/bookings")
		{
			bookings.GET("", Protect(), Admin(), GetBookingsHandler)
			bookings.POST("", CreateBookingHandler)
			bookings.PUT("/:id", Protect(), Admin(), UpdateBookingHandler)
		}

		// Aviatury routes
		aviatury := api.Group("/aviatury")
		{
			aviatury.GET("", GetAviaturyHandler)
			aviatury.GET("/:id", GetAviaturByIDHandler)
			aviatury.POST("", Protect(), Admin(), CreateAviaturHandler)
			aviatury.PUT("/reorder", Protect(), Admin(), ReorderAviaturyHandler)
			aviatury.PUT("/:id", Protect(), Admin(), UpdateAviaturHandler)
			aviatury.DELETE("/:id", Protect(), Admin(), DeleteAviaturHandler)
		}

		// Upload route
		api.POST("/upload", Protect(), Admin(), UploadHandler)

		// Analytics routes
		analytics := api.Group("/analytics")
		{
			analytics.POST("/view", RecordViewHandler)
			analytics.GET("/stats", Protect(), Admin(), GetAnalyticsStatsHandler)
			analytics.GET("/all-items", Protect(), Admin(), GetAllItemsViewsHandler)
		}
	}

	// Sitemap and Robots
	r.GET("/sitemap.xml", HandleSitemapRoute())
	r.GET("/robots.txt", HandleRobotsRoute())

	// Serve React Frontend in Production
	if isProduction {
		r.GET("/", HandleSEORoute())
		r.GET("/destinations", HandleSEORoute())
		r.GET("/tours/:id", HandleSEORoute())
		r.GET("/destinations/:slug", HandleSEORoute())
		r.NoRoute(ServeStaticOrIndex())
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "5051"
	}

	log.Printf("🚀 Go Server started on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start Go server: %v", err)
	}
}
