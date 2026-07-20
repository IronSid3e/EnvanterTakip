namespace EnvanterTakip.API.DTOs.Sales
{
    public class DashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public int TotalSales { get; set; }
        public decimal TotalRevenue { get; set; }
        public int LowStockProducts { get; set; }
        public int OutOfStockProducts { get; set; }
        public List<RecentSaleDto> RecentSales { get; set; } = new();
        public List<TopSellingProductDto> TopSellingProducts { get; set; } = new();
    }

    public class RecentSaleDto
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string SellerName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime SaleDate { get; set; }
    }

    public class TopSellingProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int TotalSold { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
