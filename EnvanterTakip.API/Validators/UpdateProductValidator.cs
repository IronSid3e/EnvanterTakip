using FluentValidation;
using EnvanterTakip.API.DTOs.Products;

namespace EnvanterTakip.API.Validators
{
    public class UpdateProductValidator : AbstractValidator<UpdateProductDto>
    {
        public UpdateProductValidator()
        {
            Include(new CreateProductValidator());
        }
    }
}
