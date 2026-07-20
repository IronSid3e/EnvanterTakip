using Microsoft.EntityFrameworkCore;
using EnvanterTakip.API.Data;
using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.Products;
using EnvanterTakip.API.Interfaces;
using EnvanterTakip.API.Models;

namespace EnvanterTakip.API.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<PaginatedResponse<ProductResponseDto>>> GetAllAsync(ProductFilterQuery query)
        {
            var queryable = _context.Products.AsQueryable();

            // Arama filtresi
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.ToLower();
                queryable = queryable.Where(p =>
                    p.Name.ToLower().Contains(search) ||
                    (p.Barcode != null && p.Barcode.ToLower().Contains(search)) ||
                    p.Category.ToLower().Contains(search) ||
                    p.Description.ToLower().Contains(search));
            }

            // Kategori filtresi
            if (!string.IsNullOrWhiteSpace(query.Category))
            {
                queryable = queryable.Where(p => p.Category == query.Category);
            }

            // Fiyat filtresi
            if (query.MinPrice.HasValue)
                queryable = queryable.Where(p => p.Price >= query.MinPrice.Value);

            if (query.MaxPrice.HasValue)
                queryable = queryable.Where(p => p.Price <= query.MaxPrice.Value);

            // Stok filtresi
            if (query.InStock.HasValue)
            {
                queryable = query.InStock.Value
                    ? queryable.Where(p => p.Stock > 0)
                    : queryable.Where(p => p.Stock == 0);
            }

            // Sıralama
            queryable = query.SortBy?.ToLower() switch
            {
                "name" => query.SortDescending
                    ? queryable.OrderByDescending(p => p.Name)
                    : queryable.OrderBy(p => p.Name),
                "price" => query.SortDescending
                    ? queryable.OrderByDescending(p => p.Price)
                    : queryable.OrderBy(p => p.Price),
                "stock" => query.SortDescending
                    ? queryable.OrderByDescending(p => p.Stock)
                    : queryable.OrderBy(p => p.Stock),
                "category" => query.SortDescending
                    ? queryable.OrderByDescending(p => p.Category)
                    : queryable.OrderBy(p => p.Category),
                _ => queryable.OrderByDescending(p => p.Id)
            };

            var totalCount = await queryable.CountAsync();

            var items = await queryable
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(p => MapToResponseDto(p))
                .ToListAsync();

            var result = new PaginatedResponse<ProductResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };

            return ApiResponse<PaginatedResponse<ProductResponseDto>>.Ok(result);
        }

        public async Task<ApiResponse<ProductResponseDto>> GetByIdAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return ApiResponse<ProductResponseDto>.Fail("Ürün bulunamadı.", $"ID={id} olan ürün mevcut değil.");

            return ApiResponse<ProductResponseDto>.Ok(MapToResponseDto(product));
        }

        public async Task<ApiResponse<ProductResponseDto>> GetByBarcodeAsync(string barcode)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Barcode != null && p.Barcode.ToLower() == barcode.ToLower());

            if (product == null)
                return ApiResponse<ProductResponseDto>.Fail("Ürün bulunamadı.", $"'{barcode}' barkodlu ürün mevcut değil.");

            return ApiResponse<ProductResponseDto>.Ok(MapToResponseDto(product));
        }

        public async Task<ApiResponse<ProductResponseDto>> CreateAsync(CreateProductDto dto)
        {
            // Barkod benzersizlik kontrolü
            if (!string.IsNullOrWhiteSpace(dto.Barcode))
            {
                var exists = await _context.Products.AnyAsync(p => p.Barcode == dto.Barcode);
                if (exists)
                    return ApiResponse<ProductResponseDto>.Fail("Bu barkod zaten kullanımda.", $"'{dto.Barcode}' barkodu ile kayıtlı bir ürün mevcut.");
            }

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Barcode = dto.Barcode,
                Stock = dto.Stock,
                Category = dto.Category,
                Price = dto.Price,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return ApiResponse<ProductResponseDto>.Ok(
                MapToResponseDto(product),
                "Ürün başarıyla oluşturuldu.");
        }

        public async Task<ApiResponse<ProductResponseDto>> UpdateAsync(int id, UpdateProductDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return ApiResponse<ProductResponseDto>.Fail("Ürün bulunamadı.", $"ID={id} olan ürün mevcut değil.");

            // Barkod benzersizlik kontrolü (kendi hariç)
            if (!string.IsNullOrWhiteSpace(dto.Barcode))
            {
                var exists = await _context.Products
                    .AnyAsync(p => p.Barcode == dto.Barcode && p.Id != id);
                if (exists)
                    return ApiResponse<ProductResponseDto>.Fail("Bu barkod başka bir üründe kullanımda.", $"'{dto.Barcode}' barkodu ile kayıtlı başka bir ürün mevcut.");
            }

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Barcode = dto.Barcode;
            product.Stock = dto.Stock;
            product.Category = dto.Category;
            product.Price = dto.Price;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse<ProductResponseDto>.Ok(
                MapToResponseDto(product),
                "Ürün başarıyla güncellendi.");
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return ApiResponse<bool>.Fail("Ürün bulunamadı.", $"ID={id} olan ürün mevcut değil.");

            var hasSales = await _context.Sales.AnyAsync(s => s.ProductId == id);
            if (hasSales)
                return ApiResponse<bool>.Fail("Bu ürüne ait satış kayıtları bulunduğu için silinemez.", "İlişkili satış kayıtları mevcut.");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Ürün başarıyla silindi.");
        }

        public async Task<ApiResponse<List<string>>> GetCategoriesAsync()
        {
            var categories = await _context.Products
                .Where(p => !string.IsNullOrEmpty(p.Category))
                .Select(p => p.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return ApiResponse<List<string>>.Ok(categories);
        }

        private static ProductResponseDto MapToResponseDto(Product product)
        {
            return new ProductResponseDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Barcode = product.Barcode,
                Stock = product.Stock,
                Category = product.Category,
                Price = product.Price,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt
            };
        }
    }
}
