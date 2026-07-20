using System.ComponentModel.DataAnnotations;

namespace EnvanterTakip.API.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Barcode { get; set; }

        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        [Required, MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        [Range(0, (double)decimal.MaxValue)]
        public decimal Price { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<Sale> Sales { get; set; } = new List<Sale>();
    }
}
