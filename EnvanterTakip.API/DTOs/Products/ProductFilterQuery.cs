using EnvanterTakip.API.DTOs.Common;

namespace EnvanterTakip.API.DTOs.Products
{
    public class ProductFilterQuery : PaginationQuery
    {
        public string? Category { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public bool? InStock { get; set; }
    }
}
