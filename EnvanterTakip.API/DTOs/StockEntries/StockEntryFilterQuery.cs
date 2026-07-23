using EnvanterTakip.API.DTOs.Common;

namespace EnvanterTakip.API.DTOs.StockEntries
{
    public class StockEntryFilterQuery : PaginationQuery
    {
        public int? ProductId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SupplierName { get; set; }
    }
}
