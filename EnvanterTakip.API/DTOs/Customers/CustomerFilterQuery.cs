using EnvanterTakip.API.DTOs.Common;

namespace EnvanterTakip.API.DTOs.Customers
{
    public class CustomerFilterQuery : PaginationQuery
    {
        public string? Type { get; set; }
    }
}
