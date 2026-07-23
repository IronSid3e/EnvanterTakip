using Microsoft.AspNetCore.Mvc;
using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.Invoices;
using EnvanterTakip.API.Interfaces;

namespace EnvanterTakip.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public InvoicesController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        /// <summary>
        /// Tüm faturaları sayfalı olarak getirir.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<InvoiceResponseDto>>), 200)]
        public async Task<IActionResult> GetInvoices([FromQuery] InvoiceFilterQuery query)
        {
            var result = await _invoiceService.GetAllAsync(query);
            return Ok(result);
        }

        /// <summary>
        /// ID ile fatura detayını getirir.
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<InvoiceResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<InvoiceResponseDto>), 404)]
        public async Task<IActionResult> GetInvoice(int id)
        {
            var result = await _invoiceService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        /// <summary>
        /// Yeni bir fatura oluşturur.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<InvoiceResponseDto>), 201)]
        [ProducesResponseType(typeof(ApiResponse<InvoiceResponseDto>), 400)]
        public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceDto dto)
        {
            var result = await _invoiceService.CreateAsync(dto);
            if (!result.Success)
                return BadRequest(result);
            return CreatedAtAction(nameof(GetInvoice), new { id = result.Data!.Id }, result);
        }

        /// <summary>
        /// Fatura durumunu günceller.
        /// </summary>
        [HttpPut("{id:int}/status")]
        [ProducesResponseType(typeof(ApiResponse<InvoiceResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<InvoiceResponseDto>), 400)]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateInvoiceStatusDto dto)
        {
            var result = await _invoiceService.UpdateStatusAsync(id, dto.Status);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        /// <summary>
        /// Faturayı siler. Sadece taslak faturalar silinebilir.
        /// </summary>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
        [ProducesResponseType(typeof(ApiResponse<bool>), 400)]
        public async Task<IActionResult> DeleteInvoice(int id)
        {
            var result = await _invoiceService.DeleteAsync(id);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        /// <summary>
        /// Faturanın PDF dosyasını indirir.
        /// </summary>
        [HttpGet("{id:int}/pdf")]
        [ProducesResponseType(typeof(FileResult), 200)]
        [ProducesResponseType(typeof(ApiResponse<byte[]>), 404)]
        public async Task<IActionResult> GetPdf(int id)
        {
            var result = await _invoiceService.GetPdfAsync(id);
            if (!result.Success)
                return NotFound(result);
            return File(result.Data!, "application/pdf", $"fatura_{id}.pdf");
        }
    }
}
