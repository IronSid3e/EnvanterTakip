using Microsoft.AspNetCore.Mvc;
using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.Products;
using EnvanterTakip.API.Interfaces;

namespace EnvanterTakip.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        /// <summary>
        /// Tüm ürünleri sayfalı olarak getirir. Arama, filtreleme ve sıralama yapılabilir.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<ProductResponseDto>>), 200)]
        public async Task<IActionResult> GetProducts([FromQuery] ProductFilterQuery query)
        {
            var result = await _productService.GetAllAsync(query);
            return Ok(result);
        }

        /// <summary>
        /// ID ile ürün detayını getirir.
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), 404)]
        public async Task<IActionResult> GetProduct(int id)
        {
            var result = await _productService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        /// <summary>
        /// Barkod numarası ile ürün getirir.
        /// </summary>
        [HttpGet("barcode/{barcode}")]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), 404)]
        public async Task<IActionResult> GetProductByBarcode(string barcode)
        {
            var result = await _productService.GetByBarcodeAsync(barcode);
            return result.Success ? Ok(result) : NotFound(result);
        }

        /// <summary>
        /// Yeni bir ürün oluşturur.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), 201)]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), 400)]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            var result = await _productService.CreateAsync(dto);
            return result.Success
                ? CreatedAtAction(nameof(GetProduct), new { id = result.Data!.Id }, result)
                : BadRequest(result);
        }

        /// <summary>
        /// Mevcut bir ürünü günceller.
        /// </summary>
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), 400)]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), 404)]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
        {
            var result = await _productService.UpdateAsync(id, dto);
            if (!result.Success)
            {
                return result.Message.Contains("bulunamadı") ? NotFound(result) : BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Bir ürünü siler (satış kaydı yoksa).
        /// </summary>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
        [ProducesResponseType(typeof(ApiResponse<bool>), 400)]
        [ProducesResponseType(typeof(ApiResponse<bool>), 404)]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _productService.DeleteAsync(id);
            if (!result.Success)
            {
                return result.Message.Contains("bulunamadı") ? NotFound(result) : BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Tüm kategorileri getirir.
        /// </summary>
        [HttpGet("categories")]
        [ProducesResponseType(typeof(ApiResponse<List<string>>), 200)]
        public async Task<IActionResult> GetCategories()
        {
            var result = await _productService.GetCategoriesAsync();
            return Ok(result);
        }
    }
}
