using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.StockEntries;

namespace EnvanterTakip.API.Interfaces
{
    public interface IStockEntryService
    {
        Task<ApiResponse<PaginatedResponse<StockEntryResponseDto>>> GetAllAsync(StockEntryFilterQuery query);
        Task<ApiResponse<StockEntryResponseDto>> GetByIdAsync(int id);
        Task<ApiResponse<StockEntryResponseDto>> CreateAsync(CreateStockEntryDto dto);
    }
}
