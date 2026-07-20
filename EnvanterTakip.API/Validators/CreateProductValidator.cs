using FluentValidation;
using EnvanterTakip.API.DTOs.Products;

namespace EnvanterTakip.API.Validators
{
    public class CreateProductValidator : AbstractValidator<CreateProductDto>
    {
        public CreateProductValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Ürün adı boş olamaz.")
                .MaximumLength(200).WithMessage("Ürün adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.Barcode)
                .MaximumLength(50).WithMessage("Barkod en fazla 50 karakter olabilir.")
                .When(x => x.Barcode != null);

            RuleFor(x => x.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Fiyat negatif olamaz.");

            RuleFor(x => x.Stock)
                .GreaterThanOrEqualTo(0).WithMessage("Stok miktarı negatif olamaz.");

            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("Kategori boş olamaz.")
                .MaximumLength(100).WithMessage("Kategori en fazla 100 karakter olabilir.");

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Açıklama en fazla 1000 karakter olabilir.");
        }
    }
}
