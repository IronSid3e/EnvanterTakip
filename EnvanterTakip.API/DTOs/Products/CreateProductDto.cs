namespace EnvanterTakip.API.DTOs.Products
{
    public class CreateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public int Stock { get; set; }
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
