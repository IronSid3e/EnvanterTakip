namespace EnvanterTakip.API.DTOs.Sales
{
    public class CreateSaleDto
    {
        public int ProductId { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public DateTime SaleDate { get; set; } = DateTime.UtcNow;
    }
}
