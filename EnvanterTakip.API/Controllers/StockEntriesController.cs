using Microsoft.AspNetCore.Mvc;
using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.StockEntries;
using EnvanterTakip.API.Interfaces;

namespace EnvanterTakip.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class StockEntriesController : ControllerBase
    {
        private readonly IStockEntryService _stockEntryService;

        public StockEntriesController(IStockEntryService stockEntryService)
        {
            _stockEntryService = stockEntryService;
        }

        /// <summary>
        /// Tüm stok girişlerini sayfali olarak getirir. Tarih, ürün ve tedarikçi filtresi yapılabilir.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<StockEntryResponseDto>>), 200)]
        public async Task<IActionResult> GetStockEntries([FromQuery] StockEntryFilterQuery query)
        {
            var result = await _stockEntryService.GetAllAsync(query);
            return Ok(result);
        }

        /// <summary>
        /// ID ile stok girişi detayını getirir.
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<StockEntryResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<StockEntryResponseDto>), 404)]
        public async Task<IActionResult> GetStockEntry(int id)
        {
            var result = await _stockEntryService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        /// <summary>
        /// Yeni bir stok girişi kaydı oluşturur. Stok otomatik olarak güncellenir.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<StockEntryResponseDto>), 201)]
        [ProducesResponseType(typeof(ApiResponse<StockEntryResponseDto>), 400)]
        [ProducesResponseType(typeof(ApiResponse<StockEntryResponseDto>), 404)]
        public async Task<IActionResult> CreateStockEntry([FromBody] CreateStockEntryDto dto)
        {
            var result = await _stockEntryService.CreateAsync(dto);
            if (!result.Success)
            {
                return result.Message.Contains("bulunamadı") ? NotFound(result) : BadRequest(result);
            }
            return CreatedAtAction(nameof(GetStockEntry), new { id = result.Data!.Id }, result);
        }
    }
}
