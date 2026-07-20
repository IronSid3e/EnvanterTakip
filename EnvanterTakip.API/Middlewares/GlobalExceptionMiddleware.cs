using System.Net;
using System.Text.Json;
using EnvanterTakip.API.DTOs.Common;

namespace EnvanterTakip.API.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        private static readonly JsonSerializerOptions s_jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Beklenmeyen bir hata oluştu: {Message}", ex.Message);
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var (statusCode, message) = exception switch
            {
                ArgumentException argEx => (HttpStatusCode.BadRequest, argEx.Message),
                KeyNotFoundException keyEx => (HttpStatusCode.NotFound, keyEx.Message),
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Bu işlem için yetkiniz yok."),
                InvalidOperationException opEx => (HttpStatusCode.Conflict, opEx.Message),
                TimeoutException => (HttpStatusCode.RequestTimeout, "İşlem zaman aşımına uğradı."),
                _ => (HttpStatusCode.InternalServerError, "Sunucu tarafında beklenmeyen bir hata oluştu.")
            };

            context.Response.StatusCode = (int)statusCode;

            var response = ApiResponse<object>.Fail(message, $"Hata türü: {exception.GetType().Name}");

            await context.Response.WriteAsync(JsonSerializer.Serialize(response, s_jsonOptions));
        }
    }
}
