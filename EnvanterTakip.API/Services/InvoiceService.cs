using Microsoft.EntityFrameworkCore;
using EnvanterTakip.API.Data;
using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.Invoices;
using EnvanterTakip.API.Interfaces;
using EnvanterTakip.API.Models;

namespace EnvanterTakip.API.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly AppDbContext _context;
        private readonly IPdfService _pdfService;

        public InvoiceService(AppDbContext context, IPdfService pdfService)
        {
            _context = context;
            _pdfService = pdfService;
        }

        public async Task<ApiResponse<PaginatedResponse<InvoiceResponseDto>>> GetAllAsync(InvoiceFilterQuery query)
        {
            var queryable = _context.Invoices
                .Include(i => i.Sale)
                    .ThenInclude(s => s!.Product)
                .Include(i => i.Customer)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Status))
                queryable = queryable.Where(i => i.Status == query.Status);

            if (query.CustomerId.HasValue)
                queryable = queryable.Where(i => i.CustomerId == query.CustomerId.Value);

            if (query.StartDate.HasValue)
                queryable = queryable.Where(i => i.InvoiceDate >= query.StartDate.Value);

            if (query.EndDate.HasValue)
                queryable = queryable.Where(i => i.InvoiceDate <= query.EndDate.Value);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.ToLower();
                queryable = queryable.Where(i =>
                    i.InvoiceNumber.ToLower().Contains(search) ||
                    (i.Customer != null && i.Customer.Name.ToLower().Contains(search)));
            }

            queryable = query.SortBy?.ToLower() switch
            {
                "invoicenumber" => query.SortDescending
                    ? queryable.OrderByDescending(i => i.InvoiceNumber)
                    : queryable.OrderBy(i => i.InvoiceNumber),
                "totalamount" => query.SortDescending
                    ? queryable.OrderByDescending(i => i.TotalAmount)
                    : queryable.OrderBy(i => i.TotalAmount),
                "status" => query.SortDescending
                    ? queryable.OrderByDescending(i => i.Status)
                    : queryable.OrderBy(i => i.Status),
                _ => queryable.OrderByDescending(i => i.InvoiceDate)
            };

            var totalCount = await queryable.CountAsync();

            var items = await queryable
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(i => MapToResponseDto(i))
                .ToListAsync();

            var result = new PaginatedResponse<InvoiceResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };

            return ApiResponse<PaginatedResponse<InvoiceResponseDto>>.Ok(result);
        }

        public async Task<ApiResponse<InvoiceResponseDto>> GetByIdAsync(int id)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Sale)
                    .ThenInclude(s => s!.Product)
                .Include(i => i.Customer)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
                return ApiResponse<InvoiceResponseDto>.Fail("Fatura bulunamadı.", $"ID={id} olan fatura mevcut değil.");

            return ApiResponse<InvoiceResponseDto>.Ok(MapToResponseDto(invoice));
        }

        public async Task<ApiResponse<InvoiceResponseDto>> CreateAsync(CreateInvoiceDto dto)
        {
            var sale = await _context.Sales
                .Include(s => s.Product)
                .FirstOrDefaultAsync(s => s.Id == dto.SaleId);

            if (sale == null)
                return ApiResponse<InvoiceResponseDto>.Fail("Satış bulunamadı.", $"ID={dto.SaleId} olan satış mevcut değil.");

            var customer = await _context.Customers.FindAsync(dto.CustomerId);
            if (customer == null)
                return ApiResponse<InvoiceResponseDto>.Fail("Müşteri bulunamadı.", $"ID={dto.CustomerId} olan müşteri mevcut değil.");

            var existingInvoice = await _context.Invoices.AnyAsync(i => i.SaleId == dto.SaleId);
            if (existingInvoice)
                return ApiResponse<InvoiceResponseDto>.Fail("Bu satışa zaten bir fatura oluşturulmuş.");

            var taxAmount = sale.TotalPrice * dto.TaxRate / 100;
            var totalAmount = sale.TotalPrice + taxAmount;

            var invoice = new Invoice
            {
                InvoiceNumber = dto.InvoiceNumber,
                SaleId = dto.SaleId,
                CustomerId = dto.CustomerId,
                InvoiceDate = dto.InvoiceDate,
                TaxRate = dto.TaxRate,
                TaxAmount = taxAmount,
                TotalAmount = totalAmount,
                Status = "Draft",
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            // Navigation property'leri doldur
            invoice.Sale = sale;
            invoice.Customer = customer;

            return ApiResponse<InvoiceResponseDto>.Ok(
                MapToResponseDto(invoice),
                "Fatura başarıyla oluşturuldu.");
        }

        public async Task<ApiResponse<InvoiceResponseDto>> UpdateStatusAsync(int id, string status)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Sale)
                    .ThenInclude(s => s!.Product)
                .Include(i => i.Customer)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
                return ApiResponse<InvoiceResponseDto>.Fail("Fatura bulunamadı.", $"ID={id} olan fatura mevcut değil.");

            if (invoice.Status == "Cancelled")
                return ApiResponse<InvoiceResponseDto>.Fail("İptal edilmiş fatura güncellenemez.");

            var validStatuses = new[] { "Draft", "Sent", "Paid", "Cancelled" };
            if (!validStatuses.Contains(status))
                return ApiResponse<InvoiceResponseDto>.Fail("Geçersiz fatura durumu.");

            invoice.Status = status;
            await _context.SaveChangesAsync();

            return ApiResponse<InvoiceResponseDto>.Ok(
                MapToResponseDto(invoice),
                "Fatura durumu güncellendi.");
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
                return ApiResponse<bool>.Fail("Fatura bulunamadı.", $"ID={id} olan fatura mevcut değil.");

            if (invoice.Status != "Draft")
                return ApiResponse<bool>.Fail("Sadece taslak faturalar silinebilir.");

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Fatura başarıyla silindi.");
        }

        public async Task<ApiResponse<byte[]>> GetPdfAsync(int id)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Sale)
                    .ThenInclude(s => s!.Product)
                .Include(i => i.Customer)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
                return ApiResponse<byte[]>.Fail("Fatura bulunamadı.", $"ID={id} olan fatura mevcut değil.");

            var dto = MapToResponseDto(invoice);
            var pdfBytes = _pdfService.GenerateInvoicePdf(dto);

            return ApiResponse<byte[]>.Ok(pdfBytes, "PDF başarıyla oluşturuldu.");
        }

        private static InvoiceResponseDto MapToResponseDto(Invoice invoice)
        {
            return new InvoiceResponseDto
            {
                Id = invoice.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                SaleId = invoice.SaleId,
                ProductName = invoice.Sale?.Product?.Name ?? string.Empty,
                Quantity = invoice.Sale?.Quantity ?? 0,
                UnitPrice = invoice.Sale?.Product?.Price ?? 0,
                SaleTotalPrice = invoice.Sale?.TotalPrice ?? 0,
                CustomerId = invoice.CustomerId,
                CustomerName = invoice.Customer?.Name ?? string.Empty,
                CustomerType = invoice.Customer?.Type ?? string.Empty,
                CustomerTaxNumber = invoice.Customer?.TaxNumber,
                CustomerTaxOffice = invoice.Customer?.TaxOffice,
                CustomerNationalId = invoice.Customer?.NationalId,
                CustomerAddress = invoice.Customer?.Address,
                CustomerPhone = invoice.Customer?.Phone,
                InvoiceDate = invoice.InvoiceDate,
                TaxRate = invoice.TaxRate,
                TaxAmount = invoice.TaxAmount,
                TotalAmount = invoice.TotalAmount,
                Status = invoice.Status,
                Notes = invoice.Notes,
                CreatedAt = invoice.CreatedAt
            };
        }
    }
}
