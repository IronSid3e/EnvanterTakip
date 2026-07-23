using Microsoft.EntityFrameworkCore;
using EnvanterTakip.API.Data;
using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.Sales;
using EnvanterTakip.API.Interfaces;
using EnvanterTakip.API.Models;

namespace EnvanterTakip.API.Services
{
    public class SaleService : ISaleService
    {
        private readonly AppDbContext _context;

        public SaleService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<PaginatedResponse<SaleResponseDto>>> GetAllAsync(SaleFilterQuery query)
        {
            var queryable = _context.Sales
                .Include(s => s.Product)
                .AsQueryable();

            // Ürün filtresi
            if (query.ProductId.HasValue)
                queryable = queryable.Where(s => s.ProductId == query.ProductId.Value);

            // Tarih filtresi
            if (query.StartDate.HasValue)
                queryable = queryable.Where(s => s.SaleDate >= query.StartDate.Value);

            if (query.EndDate.HasValue)
                queryable = queryable.Where(s => s.SaleDate <= query.EndDate.Value);

            // Satıcı filtresi
            if (!string.IsNullOrWhiteSpace(query.SellerName))
            {
                var seller = query.SellerName.ToLower();
                queryable = queryable.Where(s => s.SellerName.ToLower().Contains(seller));
            }

            // Arama filtresi
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.ToLower();
                queryable = queryable.Where(s =>
                    s.SellerName.ToLower().Contains(search) ||
                    (s.Product != null && s.Product.Name.ToLower().Contains(search)));
            }

            // Sıralama
            queryable = query.SortBy?.ToLower() switch
            {
                "seller" => query.SortDescending
                    ? queryable.OrderByDescending(s => s.SellerName)
                    : queryable.OrderBy(s => s.SellerName),
                "totalprice" => query.SortDescending
                    ? queryable.OrderByDescending(s => s.TotalPrice)
                    : queryable.OrderBy(s => s.TotalPrice),
                "quantity" => query.SortDescending
                    ? queryable.OrderByDescending(s => s.Quantity)
                    : queryable.OrderBy(s => s.Quantity),
                _ => queryable.OrderByDescending(s => s.SaleDate)
            };

            var totalCount = await queryable.CountAsync();

            var items = await queryable
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(s => MapToResponseDto(s))
                .ToListAsync();

            var result = new PaginatedResponse<SaleResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };

            return ApiResponse<PaginatedResponse<SaleResponseDto>>.Ok(result);
        }

        public async Task<ApiResponse<SaleResponseDto>> GetByIdAsync(int id)
        {
            var sale = await _context.Sales
                .Include(s => s.Product)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sale == null)
                return ApiResponse<SaleResponseDto>.Fail("Satış kaydı bulunamadı.", $"ID={id} olan satış mevcut değil.");

            return ApiResponse<SaleResponseDto>.Ok(MapToResponseDto(sale));
        }

        public async Task<ApiResponse<SaleResponseDto>> CreateAsync(CreateSaleDto dto)
        {
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
                return ApiResponse<SaleResponseDto>.Fail("Ürün bulunamadı.", $"ID={dto.ProductId} olan ürün mevcut değil.");

            if (product.Stock < dto.Quantity)
                return ApiResponse<SaleResponseDto>.Fail(
                    "Yetersiz stok.",
                    $"Mevcut stok: {product.Stock}, İstenen: {dto.Quantity}");

            var sale = new Sale
            {
                ProductId = dto.ProductId,
                SellerName = dto.SellerName,
                Quantity = dto.Quantity,
                SaleDate = dto.SaleDate,
                TotalPrice = product.Price * dto.Quantity,
                CreatedAt = DateTime.UtcNow
            };

            _context.Sales.Add(sale);

            // Stok güncelle
            product.Stock -= dto.Quantity;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Navigation property'i doldur
            sale.Product = product;

            return ApiResponse<SaleResponseDto>.Ok(
                MapToResponseDto(sale),
                "Satış başarıyla kaydedildi.");
        }

        public async Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync()
        {
            var today = DateTime.UtcNow.Date;

            var totalProducts = await _context.Products.CountAsync();
            var totalSales = await _context.Sales.CountAsync();
            var lowStockProducts = await _context.Products
                .Where(p => p.Stock < 5)
                .CountAsync();
            var outOfStockProducts = await _context.Products
                .Where(p => p.Stock == 0)
                .CountAsync();
            var totalStockCount = await _context.Products.SumAsync(p => p.Stock);
            var todaySalesCount = await _context.Sales
                .Where(s => s.SaleDate >= today)
                .CountAsync();

            var recentSales = await _context.Sales
                .Include(s => s.Product)
                .OrderByDescending(s => s.SaleDate)
                .Take(5)
                .Select(s => new RecentSaleDto
                {
                    Id = s.Id,
                    ProductName = s.Product!.Name,
                    SellerName = s.SellerName,
                    Quantity = s.Quantity,
                    SaleDate = s.SaleDate
                })
                .ToListAsync();

            var topSellingProducts = await _context.Sales
                .Include(s => s.Product)
                .GroupBy(s => new { s.ProductId, s.Product!.Name })
                .Select(g => new TopSellingProductDto
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.Name,
                    TotalSold = g.Sum(s => s.Quantity)
                })
                .OrderByDescending(x => x.TotalSold)
                .Take(5)
                .ToListAsync();

            var stats = new DashboardStatsDto
            {
                TotalProducts = totalProducts,
                TotalSales = totalSales,
                LowStockProducts = lowStockProducts,
                OutOfStockProducts = outOfStockProducts,
                TotalStockCount = totalStockCount,
                TodaySalesCount = todaySalesCount,
                RecentSales = recentSales,
                TopSellingProducts = topSellingProducts
            };

            return ApiResponse<DashboardStatsDto>.Ok(stats, "Dashboard istatistikleri başarıyla getirildi.");
        }

        private static SaleResponseDto MapToResponseDto(Sale sale)
        {
            return new SaleResponseDto
            {
                Id = sale.Id,
                ProductId = sale.ProductId,
                ProductName = sale.Product?.Name ?? string.Empty,
                SellerName = sale.SellerName,
                Quantity = sale.Quantity,
                UnitPrice = sale.Product?.Price ?? 0,
                SaleDate = sale.SaleDate,
                CreatedAt = sale.CreatedAt
            };
        }
    }
}
