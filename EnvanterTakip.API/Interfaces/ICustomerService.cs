using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.Customers;

namespace EnvanterTakip.API.Interfaces
{
    public interface ICustomerService
    {
        Task<ApiResponse<PaginatedResponse<CustomerResponseDto>>> GetAllAsync(CustomerFilterQuery query);
        Task<ApiResponse<CustomerResponseDto>> GetByIdAsync(int id);
        Task<ApiResponse<CustomerResponseDto>> CreateAsync(CreateCustomerDto dto);
        Task<ApiResponse<CustomerResponseDto>> UpdateAsync(int id, CreateCustomerDto dto);
        Task<ApiResponse<bool>> DeleteAsync(int id);
    }
}
