package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"smart-tiffin-shop-backend/config"
	"smart-tiffin-shop-backend/models"

	"github.com/gin-gonic/gin"
)


type RecentOrderItem struct {
	OrderNumber   string  `json:"order_number"`
	ItemsSummary  string  `json:"items"`
	TotalAmount   float64 `json:"amount"`
	PaymentStatus string  `json:"payment_status"`
	TimeFormatted string  `json:"time"`
}

type ChartBarItem struct {
	Label string  `json:"label"`
	Value float64 `json:"value"`
	Count int     `json:"count"`
}

type DashboardStatsResponse struct {
	TodaySales      float64           `json:"today_sales"`
	TodayOrders     int               `json:"today_orders"`
	MonthlySales    float64           `json:"monthly_sales"`
	YearlySales     float64           `json:"yearly_sales"`
	TopSellingItem  string            `json:"top_selling_item"`
	RecentOrders    []RecentOrderItem `json:"recent_orders"`
	HourlySales     []ChartBarItem    `json:"hourly_sales"`
	Last7DaysSales  []ChartBarItem    `json:"last_7_days_sales"`
	MonthlyOverview []ChartBarItem    `json:"monthly_sales_overview"`
	TopFoodItems    []ChartBarItem    `json:"top_food_items"`
}

// GET /api/admin/dashboard
func GetDashboardStats(c *gin.Context) {
	now := time.Now()
	todayStr := now.Format("2006-01-02")
	currentMonth := int(now.Month())
	currentYear := now.Year()

	var todaySales float64
	var todayOrders int
	var monthlySales float64
	var yearlySales float64
	topSellingItem := "None"

	recentOrders := []RecentOrderItem{}
	productQtyMap := make(map[string]int)
	productRevMap := make(map[string]float64)

	// Chart maps with 0-based initial structures
	hourlyMap := map[string]*ChartBarItem{
		"07 AM": {Label: "07 AM", Value: 0, Count: 0},
		"09 AM": {Label: "09 AM", Value: 0, Count: 0},
		"12 PM": {Label: "12 PM", Value: 0, Count: 0},
		"03 PM": {Label: "03 PM", Value: 0, Count: 0},
		"06 PM": {Label: "06 PM", Value: 0, Count: 0},
		"08 PM": {Label: "08 PM", Value: 0, Count: 0},
	}
	hourlyKeys := []string{"07 AM", "09 AM", "12 PM", "03 PM", "06 PM", "08 PM"}

	daysMap := map[string]*ChartBarItem{
		"Mon": {Label: "Mon", Value: 0, Count: 0},
		"Tue": {Label: "Tue", Value: 0, Count: 0},
		"Wed": {Label: "Wed", Value: 0, Count: 0},
		"Thu": {Label: "Thu", Value: 0, Count: 0},
		"Fri": {Label: "Fri", Value: 0, Count: 0},
		"Sat": {Label: "Sat", Value: 0, Count: 0},
		"Sun": {Label: "Sun", Value: 0, Count: 0},
	}
	dayKeys := []string{"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"}

	monthsMap := map[string]*ChartBarItem{
		"Jan": {Label: "Jan", Value: 0, Count: 0},
		"Feb": {Label: "Feb", Value: 0, Count: 0},
		"Mar": {Label: "Mar", Value: 0, Count: 0},
		"Apr": {Label: "Apr", Value: 0, Count: 0},
		"May": {Label: "May", Value: 0, Count: 0},
		"Jun": {Label: "Jun", Value: 0, Count: 0},
		"Jul": {Label: "Jul", Value: 0, Count: 0},
		"Aug": {Label: "Aug", Value: 0, Count: 0},
		"Sep": {Label: "Sep", Value: 0, Count: 0},
		"Oct": {Label: "Oct", Value: 0, Count: 0},
		"Nov": {Label: "Nov", Value: 0, Count: 0},
		"Dec": {Label: "Dec", Value: 0, Count: 0},
	}
	monthKeys := []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}

	if config.DB != nil && config.IsConnected {
		// 1. Today's Sales & Orders
		_ = config.DB.QueryRow(`
			SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
			FROM orders
			WHERE (payment_status = 'SUCCESS' OR payment_status = 'Completed')
			  AND DATE(created_at) = ?
		`, todayStr).Scan(&todayOrders, &todaySales)

		// 2. Monthly Sales
		_ = config.DB.QueryRow(`
			SELECT COALESCE(SUM(total_amount), 0)
			FROM orders
			WHERE (payment_status = 'SUCCESS' OR payment_status = 'Completed')
			  AND MONTH(created_at) = ? AND YEAR(created_at) = ?
		`, currentMonth, currentYear).Scan(&monthlySales)

		// 3. Yearly Sales
		_ = config.DB.QueryRow(`
			SELECT COALESCE(SUM(total_amount), 0)
			FROM orders
			WHERE (payment_status = 'SUCCESS' OR payment_status = 'Completed')
			  AND YEAR(created_at) = ?
		`, currentYear).Scan(&yearlySales)

		// 4. Top Selling Item today/this month
		var topItem string
		err := config.DB.QueryRow(`
			SELECT oi.product_name
			FROM order_items oi
			JOIN orders o ON oi.order_id = o.id
			WHERE (o.payment_status = 'SUCCESS' OR o.payment_status = 'Completed')
			GROUP BY oi.product_name
			ORDER BY SUM(oi.quantity) DESC
			LIMIT 1
		`).Scan(&topItem)
		if err == nil && topItem != "" {
			topSellingItem = topItem
		}

		// 5. Recent Orders (Top 5)
		rows, err := config.DB.Query(`
			SELECT id, order_number, total_amount, payment_status, created_at
			FROM orders
			ORDER BY id DESC
			LIMIT 5
		`)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var oId int
				var orderNum string
				var amt float64
				var status string
				var createdAt time.Time
				if err := rows.Scan(&oId, &orderNum, &amt, &status, &createdAt); err == nil {
					iRows, _ := config.DB.Query(`SELECT product_name, quantity FROM order_items WHERE order_id = ?`, oId)
					itemsSummary := ""
					if iRows != nil {
						for iRows.Next() {
							var name string
							var qty int
							if err := iRows.Scan(&name, &qty); err == nil {
								if itemsSummary != "" {
									itemsSummary += ", "
								}
								itemsSummary += fmt.Sprintf("%s x %d", name, qty)
							}
						}
						iRows.Close()
					}
					if itemsSummary == "" {
						itemsSummary = "Tiffin Combo"
					}

					recentOrders = append(recentOrders, RecentOrderItem{
						OrderNumber:   orderNum,
						ItemsSummary:  itemsSummary,
						TotalAmount:   amt,
						PaymentStatus: status,
						TimeFormatted: createdAt.Format("03:04 PM"),
					})
				}
			}
		}

		// DB Chart Aggregations
		dbRows, err := config.DB.Query(`
			SELECT created_at, total_amount
			FROM orders
			WHERE (payment_status = 'SUCCESS' OR payment_status = 'Completed')
		`)
		if err == nil {
			defer dbRows.Close()
			for dbRows.Next() {
				var cTime time.Time
				var amt float64
				if err := dbRows.Scan(&cTime, &amt); err == nil {
					if cTime.Format("2006-01-02") == todayStr {
						hr := cTime.Hour()
						slot := "08 PM"
						if hr < 8 { slot = "07 AM" } else if hr < 11 { slot = "09 AM" } else if hr < 14 { slot = "12 PM" } else if hr < 17 { slot = "03 PM" } else if hr < 19 { slot = "06 PM" }
						hourlyMap[slot].Value += amt
						hourlyMap[slot].Count++
					}
					dName := cTime.Format("Mon")
					if item, ok := daysMap[dName]; ok {
						item.Value += amt
						item.Count++
					}
					if cTime.Year() == currentYear {
						mName := cTime.Format("Jan")
						if item, ok := monthsMap[mName]; ok {
							item.Value += amt
							item.Count++
						}
					}
				}
			}
		}

		// Top Food Items from DB
		fRows, err := config.DB.Query(`
			SELECT oi.product_name, SUM(oi.quantity) as qty, SUM(oi.subtotal) as rev
			FROM order_items oi
			JOIN orders o ON oi.order_id = o.id
			WHERE (o.payment_status = 'SUCCESS' OR o.payment_status = 'Completed')
			GROUP BY oi.product_name
			ORDER BY qty DESC
		`)
		if err == nil {
			defer fRows.Close()
			for fRows.Next() {
				var pName string
				var qty int
				var rev float64
				if err := fRows.Scan(&pName, &qty, &rev); err == nil {
					productQtyMap[pName] = qty
					productRevMap[pName] = rev
				}
			}
		}

	} else {
		// In-Memory Calculation strictly from inMemoryOrders
		for _, o := range inMemoryOrders {
			statusUpper := strings.ToUpper(o.PaymentStatus)
			isSuccess := statusUpper == "SUCCESS" || statusUpper == "COMPLETED" || statusUpper == "PAID"
			
			itemsSummary := ""
			for _, item := range o.Items {
				if itemsSummary != "" {
					itemsSummary += ", "
				}
				itemsSummary += fmt.Sprintf("%s x %d", item.ProductName, item.Quantity)
			}
			if itemsSummary == "" {
				itemsSummary = "Tiffin Item"
			}

			if len(recentOrders) < 5 {
				recentOrders = append(recentOrders, RecentOrderItem{
					OrderNumber:   o.OrderNumber,
					ItemsSummary:  itemsSummary,
					TotalAmount:   o.TotalAmount,
					PaymentStatus: o.PaymentStatus,
					TimeFormatted: o.CreatedAt.Format("03:04 PM"),
				})
			}

			if isSuccess {
				if o.CreatedAt.Format("2006-01-02") == todayStr {
					todayOrders++
					todaySales += o.TotalAmount

					hr := o.CreatedAt.Hour()
					slot := "08 PM"
					if hr < 8 { slot = "07 AM" } else if hr < 11 { slot = "09 AM" } else if hr < 14 { slot = "12 PM" } else if hr < 17 { slot = "03 PM" } else if hr < 19 { slot = "06 PM" }
					hourlyMap[slot].Value += o.TotalAmount
					hourlyMap[slot].Count++
				}

				dName := o.CreatedAt.Format("Mon")
				if item, ok := daysMap[dName]; ok {
					item.Value += o.TotalAmount
					item.Count++
				}

				if int(o.CreatedAt.Month()) == currentMonth && o.CreatedAt.Year() == currentYear {
					monthlySales += o.TotalAmount
				}

				if o.CreatedAt.Year() == currentYear {
					yearlySales += o.TotalAmount

					mName := o.CreatedAt.Format("Jan")
					if item, ok := monthsMap[mName]; ok {
						item.Value += o.TotalAmount
						item.Count++
					}
				}

				for _, item := range o.Items {
					productQtyMap[item.ProductName] += item.Quantity
					productRevMap[item.ProductName] += item.Subtotal
				}
			}
		}

		topQty := 0
		for name, qty := range productQtyMap {
			if qty > topQty {
				topQty = qty
				topSellingItem = name
			}
		}
	}

	// Dynamic Chart Aggregations from Real Orders
	var hourlySales []ChartBarItem
	for _, key := range hourlyKeys {
		hourlySales = append(hourlySales, *hourlyMap[key])
	}

	var last7DaysSales []ChartBarItem
	for _, key := range dayKeys {
		last7DaysSales = append(last7DaysSales, *daysMap[key])
	}

	var monthlyOverview []ChartBarItem
	for _, key := range monthKeys {
		monthlyOverview = append(monthlyOverview, *monthsMap[key])
	}

	var topFoodItems []ChartBarItem
	for name, qty := range productQtyMap {
		topFoodItems = append(topFoodItems, ChartBarItem{
			Label: name,
			Value: productRevMap[name],
			Count: qty,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": DashboardStatsResponse{
			TodaySales:      todaySales,
			TodayOrders:     todayOrders,
			MonthlySales:    monthlySales,
			YearlySales:     yearlySales,
			TopSellingItem:  topSellingItem,
			RecentOrders:    recentOrders,
			HourlySales:     hourlySales,
			Last7DaysSales:  last7DaysSales,
			MonthlyOverview: monthlyOverview,
			TopFoodItems:    topFoodItems,
		},
	})
}

// POST /api/admin/reset-data
func ResetAllData(c *gin.Context) {
	if config.DB != nil && config.IsConnected {
		tx, err := config.DB.Begin()
		if err == nil {
			_, _ = tx.Exec("SET FOREIGN_KEY_CHECKS = 0;")
			_, _ = tx.Exec("TRUNCATE TABLE bills;")
			_, _ = tx.Exec("TRUNCATE TABLE payments;")
			_, _ = tx.Exec("TRUNCATE TABLE order_items;")
			_, _ = tx.Exec("TRUNCATE TABLE orders;")
			_, _ = tx.Exec("SET FOREIGN_KEY_CHECKS = 1;")
			_ = tx.Commit()
		}
	}

	inMemoryOrders = []models.Order{}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "All order history, bills, and sales metrics reset to 0 successfully!",
	})
}

