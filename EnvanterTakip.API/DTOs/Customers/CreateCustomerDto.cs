namespace EnvanterTakip.API.DTOs.Customers
{
    public class CreateCustomerDto
    {
        public string Type { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? TaxNumber { get; set; }
        public string? TaxOffice { get; set; }
        public string? NationalId { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
    }
}
