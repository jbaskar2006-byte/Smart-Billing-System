package controllers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"smart-tiffin-shop-backend/config"
	"smart-tiffin-shop-backend/models"

	"github.com/gin-gonic/gin"
)

var defaultProducts = []models.Product{
	{ID: 1, Name: "Idli", Price: 30.00, Category: "Tiffin Specialties", Available: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	{ID: 2, Name: "Vadai", Price: 20.00, Category: "Hot Snacks", Available: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	{ID: 3, Name: "Poori", Price: 50.00, Category: "Tiffin Specialties", Available: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	{ID: 4, Name: "Chapati", Price: 40.00, Category: "Tiffin Specialties", Available: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	{ID: 5, Name: "Pongal", Price: 45.00, Category: "Tiffin Specialties", Available: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	{ID: 6, Name: "Omelette", Price: 25.00, Category: "Egg Specials", Available: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	{ID: 7, Name: "Half Boil", Price: 20.00, Category: "Egg Specials", Available: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
}

// GET /api/products
func GetProducts(c *gin.Context) {
	if config.DB != nil && config.IsConnected {
		rows, err := config.DB.Query("SELECT id, name, price, category, available, created_at, updated_at FROM products ORDER BY id ASC")
		if err == nil {
			defer rows.Close()
			var products []models.Product
			for rows.Next() {
				var p models.Product
				if err := rows.Scan(&p.ID, &p.Name, &p.Price, &p.Category, &p.Available, &p.CreatedAt, &p.UpdatedAt); err == nil {
					products = append(products, p)
				}
			}
			if len(products) > 0 {
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"count":   len(products),
					"data":    products,
				})
				return
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(defaultProducts),
		"data":    defaultProducts,
	})
}

// GET /api/products/:id
func GetProductByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid product ID"})
		return
	}

	if config.DB != nil && config.IsConnected {
		var p models.Product
		err := config.DB.QueryRow("SELECT id, name, price, category, available, created_at, updated_at FROM products WHERE id = ?", id).
			Scan(&p.ID, &p.Name, &p.Price, &p.Category, &p.Available, &p.CreatedAt, &p.UpdatedAt)
		if err == nil {
			c.JSON(http.StatusOK, gin.H{"success": true, "data": p})
			return
		}
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Product not found"})
			return
		}
	}

	for _, p := range defaultProducts {
		if p.ID == id {
			c.JSON(http.StatusOK, gin.H{"success": true, "data": p})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Product not found"})
}

// POST /api/products
func CreateProduct(c *gin.Context) {
	var req models.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	if req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Product name is required"})
		return
	}

	if req.Price <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Price must be greater than 0"})
		return
	}

	category := req.Category
	if category == "" {
		category = "Tiffin Specialties"
	}

	available := true
	if req.Available != nil {
		available = *req.Available
	}

	now := time.Now()

	if config.DB != nil && config.IsConnected {
		res, err := config.DB.Exec(
			"INSERT INTO products (name, price, category, available, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
			req.Name, req.Price, category, available, now, now,
		)
		if err == nil {
			id, _ := res.LastInsertId()
			newProduct := models.Product{
				ID:        int(id),
				Name:      req.Name,
				Price:     req.Price,
				Category:  category,
				Available: available,
				CreatedAt: now,
				UpdatedAt: now,
			}
			c.JSON(http.StatusCreated, gin.H{
				"success": true,
				"message": "Product created successfully",
				"data":    newProduct,
			})
			return
		}
	}

	// Memory fallback
	newID := len(defaultProducts) + 1
	newProduct := models.Product{
		ID:        newID,
		Name:      req.Name,
		Price:     req.Price,
		Category:  category,
		Available: available,
		CreatedAt: now,
		UpdatedAt: now,
	}
	defaultProducts = append(defaultProducts, newProduct)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Product created successfully",
		"data":    newProduct,
	})
}

// PUT /api/products/:id
func UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid product ID"})
		return
	}

	var req models.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	now := time.Now()

	if config.DB != nil && config.IsConnected {
		var existing models.Product
		err := config.DB.QueryRow("SELECT id, name, price, category, available, created_at FROM products WHERE id = ?", id).
			Scan(&existing.ID, &existing.Name, &existing.Price, &existing.Category, &existing.Available, &existing.CreatedAt)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Product not found"})
			return
		}

		name := req.Name
		if name == "" {
			name = existing.Name
		}
		price := req.Price
		if price <= 0 {
			price = existing.Price
		}
		category := req.Category
		if category == "" {
			category = existing.Category
		}
		available := existing.Available
		if req.Available != nil {
			available = *req.Available
		}

		_, updateErr := config.DB.Exec(
			"UPDATE products SET name = ?, price = ?, category = ?, available = ?, updated_at = ? WHERE id = ?",
			name, price, category, available, now, id,
		)
		if updateErr == nil {
			updated := models.Product{
				ID:        id,
				Name:      name,
				Price:     price,
				Category:  category,
				Available: available,
				CreatedAt: existing.CreatedAt,
				UpdatedAt: now,
			}
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Product updated successfully",
				"data":    updated,
			})
			return
		}
	}

	// Memory fallback
	for i, p := range defaultProducts {
		if p.ID == id {
			if req.Name != "" {
				p.Name = req.Name
			}
			if req.Price > 0 {
				p.Price = req.Price
			}
			if req.Category != "" {
				p.Category = req.Category
			}
			if req.Available != nil {
				p.Available = *req.Available
			}
			p.UpdatedAt = now
			defaultProducts[i] = p
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Product updated successfully",
				"data":    p,
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Product not found"})
}

// DELETE /api/products/:id
func DeleteProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid product ID"})
		return
	}

	if config.DB != nil && config.IsConnected {
		res, err := config.DB.Exec("DELETE FROM products WHERE id = ?", id)
		if err == nil {
			rowsAffected, _ := res.RowsAffected()
			if rowsAffected > 0 {
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Product deleted successfully",
					"id":      id,
				})
				return
			}
		}
	}

	// Memory fallback delete
	for i, p := range defaultProducts {
		if p.ID == id {
			defaultProducts = append(defaultProducts[:i], defaultProducts[i+1:]...)
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Product deleted successfully",
				"id":      id,
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Product not found"})
}
