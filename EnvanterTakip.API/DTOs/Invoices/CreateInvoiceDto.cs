namespace EnvanterTakip.API.DTOs.Invoices
{
    public class CreateInvoiceDto
    {
        public string InvoiceNumber { get; set; } = string.Empty;
        public int SaleId { get; set; }
        public int CustomerId { get; set; }
        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
        public decimal TaxRate { get; set; }
        public string? Notes { get; set; }
    }
}
