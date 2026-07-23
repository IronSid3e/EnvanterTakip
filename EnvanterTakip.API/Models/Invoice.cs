using System.ComponentModel.DataAnnotations;

namespace EnvanterTakip.API.Models
{
    public class Invoice
    {
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string InvoiceNumber { get; set; } = string.Empty;

        [Required]
        public int SaleId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

        [Range(0, double.MaxValue)]
        public decimal TaxRate { get; set; }

        [Range(0, double.MaxValue)]
        public decimal TaxAmount { get; set; }

        [Range(0, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        [Required, MaxLength(20)]
        public string Status { get; set; } = "Draft"; // Draft, Sent, Paid, Cancelled

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Sale? Sale { get; set; }
        public Customer? Customer { get; set; }
    }
}
