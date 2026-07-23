using System.ComponentModel.DataAnnotations;

namespace EnvanterTakip.API.Models
{
    public class Customer
    {
        public int Id { get; set; }

        [Required, MaxLength(20)]
        public string Type { get; set; } = string.Empty; // "Company" or "Individual"

        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? TaxNumber { get; set; }

        [MaxLength(100)]
        public string? TaxOffice { get; set; }

        [MaxLength(11)]
        public string? NationalId { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}
