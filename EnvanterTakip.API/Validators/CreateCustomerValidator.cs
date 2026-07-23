using FluentValidation;
using EnvanterTakip.API.DTOs.Customers;

namespace EnvanterTakip.API.Validators
{
    public class CreateCustomerValidator : AbstractValidator<CreateCustomerDto>
    {
        public CreateCustomerValidator()
        {
            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("Müşteri tipi boş olamaz.")
                .Must(t => t == "Company" || t == "Individual")
                .WithMessage("Müşteri tipi 'Company' veya 'Individual' olmalıdır.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Müşteri adı boş olamaz.")
                .MaximumLength(200).WithMessage("Müşteri adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.TaxNumber)
                .MaximumLength(50).WithMessage("Vergi numarası en fazla 50 karakter olabilir.")
                .When(x => x.Type == "Company");

            RuleFor(x => x.TaxOffice)
                .MaximumLength(100).WithMessage("Vergi dairesi en fazla 100 karakter olabilir.")
                .When(x => x.Type == "Company");

            RuleFor(x => x.NationalId)
                .MaximumLength(11).WithMessage("TC kimlik numarası 11 karakter olmalıdır.")
                .When(x => x.Type == "Individual");

            RuleFor(x => x.Address)
                .MaximumLength(500).WithMessage("Adres en fazla 500 karakter olabilir.");

            RuleFor(x => x.Phone)
                .MaximumLength(20).WithMessage("Telefon en fazla 20 karakter olabilir.");
        }
    }
}
