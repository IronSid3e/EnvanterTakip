using EnvanterTakip.API.DTOs.Invoices;

namespace EnvanterTakip.API.Interfaces
{
    public interface IPdfService
    {
        byte[] GenerateInvoicePdf(InvoiceResponseDto invoice);
    }
}
