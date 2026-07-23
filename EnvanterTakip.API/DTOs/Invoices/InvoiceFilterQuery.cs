using EnvanterTakip.API.DTOs.Common;

namespace EnvanterTakip.API.DTOs.Invoices
{
    public class InvoiceFilterQuery : PaginationQuery
    {
        public string? Status { get; set; }
        public int? CustomerId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
