using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.Invoices;

namespace EnvanterTakip.API.Interfaces
{
    public interface IInvoiceService
    {
        Task<ApiResponse<PaginatedResponse<InvoiceResponseDto>>> GetAllAsync(InvoiceFilterQuery query);
        Task<ApiResponse<InvoiceResponseDto>> GetByIdAsync(int id);
        Task<ApiResponse<InvoiceResponseDto>> CreateAsync(CreateInvoiceDto dto);
        Task<ApiResponse<InvoiceResponseDto>> UpdateStatusAsync(int id, string status);
        Task<ApiResponse<bool>> DeleteAsync(int id);
        Task<ApiResponse<byte[]>> GetPdfAsync(int id);
    }
}
