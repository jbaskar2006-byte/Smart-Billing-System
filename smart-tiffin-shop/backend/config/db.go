package config

import (
	"bufio"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB
var IsConnected bool = false

func loadEnvFile() {
	file, err := os.Open(".env")
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])
			if os.Getenv(key) == "" {
				os.Setenv(key, val)
			}
		}
	}
}

func InitDB() *sql.DB {
	loadEnvFile()

	user := getEnv("DB_USER", "root")
	pass := getEnv("DB_PASSWORD", "Root@123")
	host := getEnv("DB_HOST", "127.0.0.1")
	port := getEnv("DB_PORT", "3306")
	dbname := getEnv("DB_NAME", "smart_tiffin_shop")


	// First connect to MySQL server to ensure DB exists
	serverDSN := fmt.Sprintf("%s:%s@tcp(%s:%s)/?parseTime=true", user, pass, host, port)
	serverDB, err := sql.Open("mysql", serverDSN)
	if err == nil {
		if err := serverDB.Ping(); err == nil {
			_, _ = serverDB.Exec("CREATE DATABASE IF NOT EXISTS " + dbname)
			serverDB.Close()
		}
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", user, pass, host, port, dbname)
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Printf("[WARNING] DB connection failed to open: %v", err)
		IsConnected = false
		return nil
	}

	err = DB.Ping()
	if err != nil {
		log.Printf("[WARNING] MySQL database '%s' not reachable on %s:%s (%v). Running with mock memory storage fallback.", dbname, host, port, err)
		IsConnected = false
		return DB
	}

	IsConnected = true
	log.Printf("[INFO] Successfully connected to MySQL database: %s", dbname)
	
	// Auto migrate tables if connected
	AutoMigrateTables()

	return DB
}

func AutoMigrateTables() {
	if DB == nil || !IsConnected {
		return
	}

	// 1. products table
	_, err := DB.Exec(`
		CREATE TABLE IF NOT EXISTS products (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			price DECIMAL(10, 2) NOT NULL,
			category VARCHAR(50) NOT NULL DEFAULT 'Tiffin Specialties',
			available BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Printf("[DB AUTO-MIGRATE] Error creating products table: %v", err)
	}

	// 2. orders table
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS orders (
			id INT AUTO_INCREMENT PRIMARY KEY,
			order_number VARCHAR(50) NOT NULL UNIQUE,
			total_amount DECIMAL(10, 2) NOT NULL,
			payment_status VARCHAR(30) DEFAULT 'Pending',
			order_status VARCHAR(30) DEFAULT 'Received',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Printf("[DB AUTO-MIGRATE] Error creating orders table: %v", err)
	}

	// 3. order_items table
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS order_items (
			id INT AUTO_INCREMENT PRIMARY KEY,
			order_id INT NOT NULL,
			product_id INT NULL,
			product_name VARCHAR(100) NOT NULL,
			price DECIMAL(10, 2) NOT NULL,
			quantity INT NOT NULL DEFAULT 1,
			subtotal DECIMAL(10, 2) NOT NULL,
			FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
			FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
		)
	`)
	if err != nil {
		log.Printf("[DB AUTO-MIGRATE] Error creating order_items table: %v", err)
	}

	// 4. payments table
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS payments (
			id INT AUTO_INCREMENT PRIMARY KEY,
			order_id INT NOT NULL,
			amount DECIMAL(10, 2) NOT NULL,
			payment_method VARCHAR(30) NOT NULL,
			payment_status VARCHAR(30) NOT NULL DEFAULT 'Success',
			transaction_id VARCHAR(100) DEFAULT '',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
		)
	`)
	if err != nil {
		log.Printf("[DB AUTO-MIGRATE] Error creating payments table: %v", err)
	}

	// 5. bills table
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS bills (
			id INT AUTO_INCREMENT PRIMARY KEY,
			order_id INT NOT NULL,
			bill_number VARCHAR(50) NOT NULL UNIQUE,
			total_amount DECIMAL(10, 2) NOT NULL,
			payment_transaction_id VARCHAR(100) DEFAULT '',
			generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
		)
	`)
	if err != nil {
		log.Printf("[DB AUTO-MIGRATE] Error creating bills table: %v", err)
	}

	// 6. admins table
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS admins (
			id INT AUTO_INCREMENT PRIMARY KEY,
			username VARCHAR(50) NOT NULL UNIQUE,
			password_hash VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Printf("[DB AUTO-MIGRATE] Error creating admins table: %v", err)
	}

	// Seed products if table is empty
	var count int
	err = DB.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	if err == nil && count == 0 {
		DB.Exec(`
			INSERT INTO products (name, price, category, available) VALUES
			('Idli', 30.00, 'Tiffin Specialties', TRUE),
			('Vadai', 20.00, 'Hot Snacks', TRUE),
			('Poori', 50.00, 'Tiffin Specialties', TRUE),
			('Chapati', 40.00, 'Tiffin Specialties', TRUE),
			('Pongal', 45.00, 'Tiffin Specialties', TRUE),
			('Omelette', 25.00, 'Egg Specials', TRUE),
			('Half Boil', 20.00, 'Egg Specials', TRUE)
		`)
		log.Println("[DB SEED] Default food products inserted.")
	}

	// Seed admin if table is empty
	var adminCount int
	err = DB.QueryRow("SELECT COUNT(*) FROM admins").Scan(&adminCount)
	if err == nil && adminCount == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		DB.Exec("INSERT INTO admins (username, password_hash) VALUES (?, ?)", "admin", string(hash))
		log.Println("[DB SEED] Default admin user created with bcrypt hash.")
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}
