using Microsoft.EntityFrameworkCore;
using EnvanterTakip.API.Data;
using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.Customers;
using EnvanterTakip.API.Interfaces;
using EnvanterTakip.API.Models;

namespace EnvanterTakip.API.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly AppDbContext _context;

        public CustomerService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<PaginatedResponse<CustomerResponseDto>>> GetAllAsync(CustomerFilterQuery query)
        {
            var queryable = _context.Customers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Type))
                queryable = queryable.Where(c => c.Type == query.Type);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.ToLower();
                queryable = queryable.Where(c =>
                    c.Name.ToLower().Contains(search) ||
                    (c.TaxNumber != null && c.TaxNumber.Contains(search)) ||
                    (c.NationalId != null && c.NationalId.Contains(search)) ||
                    (c.Phone != null && c.Phone.Contains(search)));
            }

            queryable = query.SortBy?.ToLower() switch
            {
                "name" => query.SortDescending
                    ? queryable.OrderByDescending(c => c.Name)
                    : queryable.OrderBy(c => c.Name),
                "type" => query.SortDescending
                    ? queryable.OrderByDescending(c => c.Type)
                    : queryable.OrderBy(c => c.Type),
                _ => queryable.OrderByDescending(c => c.CreatedAt)
            };

            var totalCount = await queryable.CountAsync();

            var items = await queryable
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(c => MapToResponseDto(c))
                .ToListAsync();

            var result = new PaginatedResponse<CustomerResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };

            return ApiResponse<PaginatedResponse<CustomerResponseDto>>.Ok(result);
        }

        public async Task<ApiResponse<CustomerResponseDto>> GetByIdAsync(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return ApiResponse<CustomerResponseDto>.Fail("Müşteri bulunamadı.", $"ID={id} olan müşteri mevcut değil.");

            return ApiResponse<CustomerResponseDto>.Ok(MapToResponseDto(customer));
        }

        public async Task<ApiResponse<CustomerResponseDto>> CreateAsync(CreateCustomerDto dto)
        {
            var customer = new Customer
            {
                Type = dto.Type,
                Name = dto.Name,
                TaxNumber = dto.TaxNumber,
                TaxOffice = dto.TaxOffice,
                NationalId = dto.NationalId,
                Address = dto.Address,
                Phone = dto.Phone,
                CreatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return ApiResponse<CustomerResponseDto>.Ok(
                MapToResponseDto(customer),
                "Müşteri başarıyla oluşturuldu.");
        }

        public async Task<ApiResponse<CustomerResponseDto>> UpdateAsync(int id, CreateCustomerDto dto)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return ApiResponse<CustomerResponseDto>.Fail("Müşteri bulunamadı.", $"ID={id} olan müşteri mevcut değil.");

            customer.Type = dto.Type;
            customer.Name = dto.Name;
            customer.TaxNumber = dto.TaxNumber;
            customer.TaxOffice = dto.TaxOffice;
            customer.NationalId = dto.NationalId;
            customer.Address = dto.Address;
            customer.Phone = dto.Phone;

            await _context.SaveChangesAsync();

            return ApiResponse<CustomerResponseDto>.Ok(
                MapToResponseDto(customer),
                "Müşteri başarıyla güncellendi.");
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return ApiResponse<bool>.Fail("Müşteri bulunamadı.", $"ID={id} olan müşteri mevcut değil.");

            var hasInvoices = await _context.Invoices.AnyAsync(i => i.CustomerId == id);
            if (hasInvoices)
                return ApiResponse<bool>.Fail("Bu müşteriye ait faturalar bulunduğu için silinemez.");

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Müşteri başarıyla silindi.");
        }

        private static CustomerResponseDto MapToResponseDto(Customer customer)
        {
            return new CustomerResponseDto
            {
                Id = customer.Id,
                Type = customer.Type,
                Name = customer.Name,
                TaxNumber = customer.TaxNumber,
                TaxOffice = customer.TaxOffice,
                NationalId = customer.NationalId,
                Address = customer.Address,
                Phone = customer.Phone,
                CreatedAt = customer.CreatedAt
            };
        }
    }
}
