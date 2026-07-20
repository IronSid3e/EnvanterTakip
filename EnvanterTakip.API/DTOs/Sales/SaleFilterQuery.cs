using EnvanterTakip.API.DTOs.Common;

namespace EnvanterTakip.API.DTOs.Sales
{
    public class SaleFilterQuery : PaginationQuery
    {
        public int? ProductId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SellerName { get; set; }
    }
}
