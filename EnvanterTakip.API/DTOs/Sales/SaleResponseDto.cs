namespace EnvanterTakip.API.DTOs.Sales
{
    public class SaleResponseDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string SellerName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime SaleDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
