using FluentValidation;
using EnvanterTakip.API.DTOs.Sales;

namespace EnvanterTakip.API.Validators
{
    public class CreateSaleValidator : AbstractValidator<CreateSaleDto>
    {
        public CreateSaleValidator()
        {
            RuleFor(x => x.ProductId)
                .GreaterThan(0).WithMessage("Geçerli bir ürün ID'si giriniz.");

            RuleFor(x => x.SellerName)
                .NotEmpty().WithMessage("Satıcı adı boş olamaz.")
                .MaximumLength(200).WithMessage("Satıcı adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("Miktar sıfırdan büyük olmalıdır.");

            RuleFor(x => x.SaleDate)
                .NotEmpty().WithMessage("Satış tarihi boş olamaz.");
        }
    }
}
