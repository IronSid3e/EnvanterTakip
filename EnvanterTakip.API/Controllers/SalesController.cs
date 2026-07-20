using Microsoft.AspNetCore.Mvc;
using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.Sales;
using EnvanterTakip.API.Interfaces;

namespace EnvanterTakip.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class SalesController : ControllerBase
    {
        private readonly ISaleService _saleService;

        public SalesController(ISaleService saleService)
        {
            _saleService = saleService;
        }

        /// <summary>
        /// Tüm satışları sayfalı olarak getirir. Tarih, ürün ve satıcı filtresi yapılabilir.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<SaleResponseDto>>), 200)]
        public async Task<IActionResult> GetSales([FromQuery] SaleFilterQuery query)
        {
            var result = await _saleService.GetAllAsync(query);
            return Ok(result);
        }

        /// <summary>
        /// ID ile satış detayını getirir.
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<SaleResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<SaleResponseDto>), 404)]
        public async Task<IActionResult> GetSale(int id)
        {
            var result = await _saleService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        /// <summary>
        /// Yeni bir satış kaydı oluşturur. Stok otomatik olarak güncellenir.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<SaleResponseDto>), 201)]
        [ProducesResponseType(typeof(ApiResponse<SaleResponseDto>), 400)]
        [ProducesResponseType(typeof(ApiResponse<SaleResponseDto>), 404)]
        public async Task<IActionResult> CreateSale([FromBody] CreateSaleDto dto)
        {
            var result = await _saleService.CreateAsync(dto);
            if (!result.Success)
            {
                return result.Message.Contains("bulunamadı") ? NotFound(result) : BadRequest(result);
            }
            return CreatedAtAction(nameof(GetSale), new { id = result.Data!.Id }, result);
        }

        /// <summary>
        /// Dashboard istatistiklerini getirir (toplam ürün, satış, gelir, stok durumu).
        /// </summary>
        [HttpGet("dashboard")]
        [ProducesResponseType(typeof(ApiResponse<DashboardStatsDto>), 200)]
        public async Task<IActionResult> GetDashboardStats()
        {
            var result = await _saleService.GetDashboardStatsAsync();
            return Ok(result);
        }
    }
}
