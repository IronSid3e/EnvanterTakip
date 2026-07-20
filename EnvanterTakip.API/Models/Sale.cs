using System.ComponentModel.DataAnnotations;

namespace EnvanterTakip.API.Models
{
    public class Sale
    {
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required, MaxLength(200)]
        public string SellerName { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        public DateTime SaleDate { get; set; } = DateTime.UtcNow;

        [Range(0, double.MaxValue)]
        public decimal TotalPrice { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Product? Product { get; set; }
    }
}
