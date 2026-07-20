using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.Sales;

namespace EnvanterTakip.API.Interfaces
{
    public interface ISaleService
    {
        Task<ApiResponse<PaginatedResponse<SaleResponseDto>>> GetAllAsync(SaleFilterQuery query);
        Task<ApiResponse<SaleResponseDto>> GetByIdAsync(int id);
        Task<ApiResponse<SaleResponseDto>> CreateAsync(CreateSaleDto dto);
        Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync();
    }
}
