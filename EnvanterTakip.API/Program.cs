using System.Text.Json;
using FluentValidation;
using FluentValidation.AspNetCore;
using EnvanterTakip.API.Data;
using EnvanterTakip.API.Interfaces;
using EnvanterTakip.API.Middlewares;
using EnvanterTakip.API.Services;
using Microsoft.EntityFrameworkCore;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Controllers + FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddControllers();

// OpenAPI (ASP.NET Core 10 built-in)
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, ct) =>
    {
        document.Info.Title = "EnvanterTakip API";
        document.Info.Version = "v1";
        document.Info.Description = "Şua Tarım Envanter Takip Sistemi API'si";
        return Task.CompletedTask;
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClientApps", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:8081"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Services
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ISaleService, SaleService>();
builder.Services.AddScoped<IStockEntryService, StockEntryService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IPdfService, PdfService>();

// JSON serialization
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

var app = builder.Build();

// Global hata yakalayıcı (en üstte olmalı)
app.UseMiddleware<GlobalExceptionMiddleware>();

// OpenAPI UI (sadece Development'ta)
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.Map("/", async context =>
    {
        context.Response.Redirect("/openapi/v1.json");
    });
}

app.UseHttpsRedirection();

// CORS (MapControllers'dan ÖNCE gelmeli)
app.UseCors("AllowClientApps");

app.MapControllers();

app.Run();
