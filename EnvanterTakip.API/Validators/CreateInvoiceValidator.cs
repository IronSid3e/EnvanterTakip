using FluentValidation;
using EnvanterTakip.API.DTOs.Invoices;

namespace EnvanterTakip.API.Validators
{
    public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceDto>
    {
        public CreateInvoiceValidator()
        {
            RuleFor(x => x.InvoiceNumber)
                .NotEmpty().WithMessage("Fatura numarası boş olamaz.")
                .MaximumLength(50).WithMessage("Fatura numarası en fazla 50 karakter olabilir.");

            RuleFor(x => x.SaleId)
                .GreaterThan(0).WithMessage("Geçerli bir satış ID'si giriniz.");

            RuleFor(x => x.CustomerId)
                .GreaterThan(0).WithMessage("Geçerli bir müşteri ID'si giriniz.");

            RuleFor(x => x.InvoiceDate)
                .NotEmpty().WithMessage("Fatura tarihi boş olamaz.");

            RuleFor(x => x.TaxRate)
                .InclusiveBetween(0, 100).WithMessage("Vergi oranı 0 ile 100 arasında olmalıdır.");
        }
    }
}
