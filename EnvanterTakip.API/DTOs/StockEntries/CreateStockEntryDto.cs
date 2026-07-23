namespace EnvanterTakip.API.DTOs.StockEntries
{
    public class CreateStockEntryDto
    {
        public int ProductId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public DateTime EntryDate { get; set; } = DateTime.UtcNow;
        public string? Note { get; set; }
    }
}
