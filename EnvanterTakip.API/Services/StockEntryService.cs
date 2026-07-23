using Microsoft.EntityFrameworkCore;
using EnvanterTakip.API.Data;
using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.StockEntries;
using EnvanterTakip.API.Interfaces;
using EnvanterTakip.API.Models;

namespace EnvanterTakip.API.Services
{
    public class StockEntryService : IStockEntryService
    {
        private readonly AppDbContext _context;

        public StockEntryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<PaginatedResponse<StockEntryResponseDto>>> GetAllAsync(StockEntryFilterQuery query)
        {
            var queryable = _context.StockEntries
                .Include(se => se.Product)
                .AsQueryable();

            if (query.ProductId.HasValue)
                queryable = queryable.Where(se => se.ProductId == query.ProductId.Value);

            if (query.StartDate.HasValue)
                queryable = queryable.Where(se => se.EntryDate >= query.StartDate.Value);

            if (query.EndDate.HasValue)
                queryable = queryable.Where(se => se.EntryDate <= query.EndDate.Value);

            if (!string.IsNullOrWhiteSpace(query.SupplierName))
            {
                var supplier = query.SupplierName.ToLower();
                queryable = queryable.Where(se => se.SupplierName.ToLower().Contains(supplier));
            }

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.ToLower();
                queryable = queryable.Where(se =>
                    se.SupplierName.ToLower().Contains(search) ||
                    (se.Product != null && se.Product.Name.ToLower().Contains(search)));
            }

            queryable = query.SortBy?.ToLower() switch
            {
                "supplier" => query.SortDescending
                    ? queryable.OrderByDescending(se => se.SupplierName)
                    : queryable.OrderBy(se => se.SupplierName),
                "quantity" => query.SortDescending
                    ? queryable.OrderByDescending(se => se.Quantity)
                    : queryable.OrderBy(se => se.Quantity),
                _ => queryable.OrderByDescending(se => se.EntryDate)
            };

            var totalCount = await queryable.CountAsync();

            var items = await queryable
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(se => MapToResponseDto(se))
                .ToListAsync();

            var result = new PaginatedResponse<StockEntryResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };

            return ApiResponse<PaginatedResponse<StockEntryResponseDto>>.Ok(result);
        }

        public async Task<ApiResponse<StockEntryResponseDto>> GetByIdAsync(int id)
        {
            var entry = await _context.StockEntries
                .Include(se => se.Product)
                .FirstOrDefaultAsync(se => se.Id == id);

            if (entry == null)
                return ApiResponse<StockEntryResponseDto>.Fail("Stok girişi bulunamadı.", $"ID={id} olan stok girişi mevcut değil.");

            return ApiResponse<StockEntryResponseDto>.Ok(MapToResponseDto(entry));
        }

        public async Task<ApiResponse<StockEntryResponseDto>> CreateAsync(CreateStockEntryDto dto)
        {
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
                return ApiResponse<StockEntryResponseDto>.Fail("Ürün bulunamadı.", $"ID={dto.ProductId} olan ürün mevcut değil.");

            var entry = new StockEntry
            {
                ProductId = dto.ProductId,
                SupplierName = dto.SupplierName,
                Quantity = dto.Quantity,
                EntryDate = dto.EntryDate,
                Note = dto.Note,
                CreatedAt = DateTime.UtcNow
            };

            _context.StockEntries.Add(entry);

            // Stok güncelle
            product.Stock += dto.Quantity;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            entry.Product = product;

            return ApiResponse<StockEntryResponseDto>.Ok(
                MapToResponseDto(entry),
                "Stok girişi başarıyla kaydedildi.");
        }

        private static StockEntryResponseDto MapToResponseDto(StockEntry entry)
        {
            return new StockEntryResponseDto
            {
                Id = entry.Id,
                ProductId = entry.ProductId,
                ProductName = entry.Product?.Name ?? string.Empty,
                SupplierName = entry.SupplierName,
                Quantity = entry.Quantity,
                EntryDate = entry.EntryDate,
                Note = entry.Note,
                CreatedAt = entry.CreatedAt
            };
        }
    }
}
