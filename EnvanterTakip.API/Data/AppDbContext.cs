using Microsoft.EntityFrameworkCore;
using EnvanterTakip.API.Models;

namespace EnvanterTakip.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Sale> Sales { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Product konfigürasyonu
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
                entity.Property(p => p.Description).HasMaxLength(1000);
                entity.Property(p => p.Barcode).HasMaxLength(50);
                entity.Property(p => p.Category).IsRequired().HasMaxLength(100);
                entity.Property(p => p.Price).HasColumnType("decimal(18,2)");
                entity.HasIndex(p => p.Barcode).IsUnique().HasFilter("\"Barcode\" IS NOT NULL");
            });

            // Sale konfigürasyonu
            modelBuilder.Entity<Sale>(entity =>
            {
                entity.HasKey(s => s.Id);
                entity.Property(s => s.SellerName).IsRequired().HasMaxLength(200);
                entity.Property(s => s.TotalPrice).HasColumnType("decimal(18,2)");

                entity.HasOne(s => s.Product)
                    .WithMany(p => p.Sales)
                    .HasForeignKey(s => s.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
