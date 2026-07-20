using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.Products;

namespace EnvanterTakip.API.Interfaces
{
    public interface IProductService
    {
        Task<ApiResponse<PaginatedResponse<ProductResponseDto>>> GetAllAsync(ProductFilterQuery query);
        Task<ApiResponse<ProductResponseDto>> GetByIdAsync(int id);
        Task<ApiResponse<ProductResponseDto>> GetByBarcodeAsync(string barcode);
        Task<ApiResponse<ProductResponseDto>> CreateAsync(CreateProductDto dto);
        Task<ApiResponse<ProductResponseDto>> UpdateAsync(int id, UpdateProductDto dto);
        Task<ApiResponse<bool>> DeleteAsync(int id);
        Task<ApiResponse<List<string>>> GetCategoriesAsync();
    }
}
