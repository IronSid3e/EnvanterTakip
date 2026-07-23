using Microsoft.EntityFrameworkCore;
using EnvanterTakip.API.Models;

namespace EnvanterTakip.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<StockEntry> StockEntries { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Invoice> Invoices { get; set; }

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

            // StockEntry konfigürasyonu
            modelBuilder.Entity<StockEntry>(entity =>
            {
                entity.HasKey(se => se.Id);
                entity.Property(se => se.SupplierName).IsRequired().HasMaxLength(200);
                entity.Property(se => se.Note).HasMaxLength(500);

                entity.HasOne(se => se.Product)
                    .WithMany(p => p.StockEntries)
                    .HasForeignKey(se => se.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Customer konfigürasyonu
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Type).IsRequired().HasMaxLength(20);
                entity.Property(c => c.Name).IsRequired().HasMaxLength(200);
                entity.Property(c => c.TaxNumber).HasMaxLength(50);
                entity.Property(c => c.TaxOffice).HasMaxLength(100);
                entity.Property(c => c.NationalId).HasMaxLength(11);
                entity.Property(c => c.Address).HasMaxLength(500);
                entity.Property(c => c.Phone).HasMaxLength(20);
            });

            // Invoice konfigürasyonu
            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.HasKey(i => i.Id);
                entity.Property(i => i.InvoiceNumber).IsRequired().HasMaxLength(50);
                entity.Property(i => i.TaxRate).HasColumnType("decimal(5,2)");
                entity.Property(i => i.TaxAmount).HasColumnType("decimal(18,2)");
                entity.Property(i => i.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(i => i.Status).IsRequired().HasMaxLength(20);
                entity.Property(i => i.Notes).HasMaxLength(1000);

                entity.HasIndex(i => i.InvoiceNumber).IsUnique();

                entity.HasOne(i => i.Sale)
                    .WithMany()
                    .HasForeignKey(i => i.SaleId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(i => i.Customer)
                    .WithMany(c => c.Invoices)
                    .HasForeignKey(i => i.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
