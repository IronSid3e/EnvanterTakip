using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using EnvanterTakip.API.DTOs.Invoices;
using EnvanterTakip.API.Interfaces;

namespace EnvanterTakip.API.Services
{
    public class PdfService : IPdfService
    {
        public byte[] GenerateInvoicePdf(InvoiceResponseDto invoice)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.MarginHorizontal(40);
                    page.MarginVertical(30);

                    page.Header().Element(header =>
                    {
                        header.Row(row =>
                        {
                            row.RelativeItem(3).Column(col =>
                            {
                                col.Item().Text("ŞUA TARIM").FontSize(20).Bold().FontColor("#2c3e50");
                                col.Item().Text("Envanter Takip Sistemi").FontSize(10).FontColor("#7f8c8d");
                            });

                            row.RelativeItem(2).AlignRight().Column(col =>
                            {
                                col.Item().Text($"Fatura No: {invoice.InvoiceNumber}").FontSize(12).Bold();
                                col.Item().Text($"Tarih: {invoice.InvoiceDate:dd.MM.yyyy}").FontSize(10);
                                col.Item().Text($"Durum: {GetStatusText(invoice.Status)}").FontSize(10).FontColor(GetStatusColor(invoice.Status));
                            });
                        });
                    });

                    page.Content().Element(content =>
                    {
                        content.PaddingVertical(10);

                        content.Row(row =>
                        {
                            row.RelativeItem().Column(col =>
                            {
                                col.Item().Text("Müşteri Bilgileri").FontSize(12).Bold().Underline().FontColor("#2c3e50");
                                col.Item().PaddingTop(5);

                                if (invoice.CustomerType == "Company")
                                {
                                    col.Item().Text($"Şirket: {invoice.CustomerName}").FontSize(10);
                                    if (!string.IsNullOrEmpty(invoice.CustomerTaxNumber))
                                        col.Item().Text($"Vergi No: {invoice.CustomerTaxNumber}").FontSize(10);
                                    if (!string.IsNullOrEmpty(invoice.CustomerTaxOffice))
                                        col.Item().Text($"Vergi Dairesi: {invoice.CustomerTaxOffice}").FontSize(10);
                                }
                                else
                                {
                                    col.Item().Text($"Ad Soyad: {invoice.CustomerName}").FontSize(10);
                                    if (!string.IsNullOrEmpty(invoice.CustomerNationalId))
                                        col.Item().Text($"TC Kimlik: {invoice.CustomerNationalId}").FontSize(10);
                                }

                                if (!string.IsNullOrEmpty(invoice.CustomerAddress))
                                    col.Item().Text($"Adres: {invoice.CustomerAddress}").FontSize(10);
                                if (!string.IsNullOrEmpty(invoice.CustomerPhone))
                                    col.Item().Text($"Tel: {invoice.CustomerPhone}").FontSize(10);
                            });
                        });

                        content.PaddingVertical(15);

                        content.Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(4);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Background("#2c3e50").Padding(5).Text("Ürün").Bold().FontSize(10).FontColor("#fff");
                                header.Cell().Background("#2c3e50").Padding(5).AlignCenter().Text("Miktar").Bold().FontSize(10).FontColor("#fff");
                                header.Cell().Background("#2c3e50").Padding(5).AlignRight().Text("Birim Fiyat").Bold().FontSize(10).FontColor("#fff");
                                header.Cell().Background("#2c3e50").Padding(5).AlignRight().Text("KDV").Bold().FontSize(10).FontColor("#fff");
                                header.Cell().Background("#2c3e50").Padding(5).AlignRight().Text("Toplam").Bold().FontSize(10).FontColor("#fff");
                            });

                            table.Cell().Padding(5).Text(invoice.ProductName).FontSize(10);
                            table.Cell().Padding(5).AlignCenter().Text($"{invoice.Quantity} adet").FontSize(10);
                            table.Cell().Padding(5).AlignRight().Text($"{invoice.UnitPrice:N2} TL").FontSize(10);
                            table.Cell().Padding(5).AlignRight().Text($"%{invoice.TaxRate}").FontSize(10);
                            table.Cell().Padding(5).AlignRight().Text($"{invoice.SaleTotalPrice:N2} TL").FontSize(10);

                            table.Cell().ColumnSpan(4).Padding(5).AlignRight().Text("Ara Toplam:").FontSize(10);
                            table.Cell().Padding(5).AlignRight().Text($"{invoice.SaleTotalPrice:N2} TL").FontSize(10);

                            table.Cell().ColumnSpan(4).Padding(5).AlignRight().Text($"KDV (%{invoice.TaxRate}):").FontSize(10);
                            table.Cell().Padding(5).AlignRight().Text($"{invoice.TaxAmount:N2} TL").FontSize(10);

                            table.Cell().ColumnSpan(4).Padding(5).AlignRight().Text("GENEL TOPLAM:").FontSize(12).Bold();
                            table.Cell().Padding(5).AlignRight().Text($"{invoice.TotalAmount:N2} TL").FontSize(12).Bold().FontColor("#27ae60");
                        });

                        if (!string.IsNullOrEmpty(invoice.Notes))
                        {
                            content.PaddingTop(20);
                            content.Column(col =>
                            {
                                col.Item().Text("Notlar").FontSize(11).Bold().FontColor("#2c3e50");
                                col.Item().PaddingTop(5).Text(invoice.Notes).FontSize(10).FontColor("#555");
                            });
                        }
                    });

                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.Span("Şua Tarım Envanter Takip Sistemi | Fatura No: ").FontSize(8).FontColor("#999");
                        text.Span(invoice.InvoiceNumber).FontSize(8).FontColor("#999");
                    });
                });
            });

            using var stream = new MemoryStream();
            document.GeneratePdf(stream);
            return stream.ToArray();
        }

        private static string GetStatusText(string status) => status switch
        {
            "Draft" => "Taslak",
            "Sent" => "Gönderildi",
            "Paid" => "Ödendi",
            "Cancelled" => "İptal",
            _ => status
        };

        private static string GetStatusColor(string status) => status switch
        {
            "Draft" => "#95a5a6",
            "Sent" => "#3498db",
            "Paid" => "#27ae60",
            "Cancelled" => "#e74c3c",
            _ => "#333"
        };
    }
}
