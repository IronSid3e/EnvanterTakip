using FluentValidation;
using EnvanterTakip.API.DTOs.StockEntries;

namespace EnvanterTakip.API.Validators
{
    public class CreateStockEntryValidator : AbstractValidator<CreateStockEntryDto>
    {
        public CreateStockEntryValidator()
        {
            RuleFor(x => x.ProductId)
                .GreaterThan(0).WithMessage("Geçerli bir ürün ID'si giriniz.");

            RuleFor(x => x.SupplierName)
                .NotEmpty().WithMessage("Tedarikçi adı boş olamaz.")
                .MaximumLength(200).WithMessage("Tedarikçi adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("Miktar sıfırdan büyük olmalıdır.");

            RuleFor(x => x.EntryDate)
                .NotEmpty().WithMessage("Giriş tarihi boş olamaz.");
        }
    }
}
