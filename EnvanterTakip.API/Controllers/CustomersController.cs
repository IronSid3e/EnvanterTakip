using Microsoft.AspNetCore.Mvc;
using EnvanterTakip.API.DTOs.Common;
using EnvanterTakip.API.DTOs.Customers;
using EnvanterTakip.API.Interfaces;

namespace EnvanterTakip.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        /// <summary>
        /// Tüm müşterileri sayfalı olarak getirir. Arama ve tip filtresi yapılabilir.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<CustomerResponseDto>>), 200)]
        public async Task<IActionResult> GetCustomers([FromQuery] CustomerFilterQuery query)
        {
            var result = await _customerService.GetAllAsync(query);
            return Ok(result);
        }

        /// <summary>
        /// ID ile müşteri detayını getirir.
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<CustomerResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<CustomerResponseDto>), 404)]
        public async Task<IActionResult> GetCustomer(int id)
        {
            var result = await _customerService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        /// <summary>
        /// Yeni bir müşteri oluşturur.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<CustomerResponseDto>), 201)]
        [ProducesResponseType(typeof(ApiResponse<CustomerResponseDto>), 400)]
        public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerDto dto)
        {
            var result = await _customerService.CreateAsync(dto);
            return result.Success
                ? CreatedAtAction(nameof(GetCustomer), new { id = result.Data!.Id }, result)
                : BadRequest(result);
        }

        /// <summary>
        /// Mevcut bir müşteriyi günceller.
        /// </summary>
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<CustomerResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<CustomerResponseDto>), 400)]
        [ProducesResponseType(typeof(ApiResponse<CustomerResponseDto>), 404)]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] CreateCustomerDto dto)
        {
            var result = await _customerService.UpdateAsync(id, dto);
            if (!result.Success)
                return result.Message.Contains("bulunamadı") ? NotFound(result) : BadRequest(result);
            return Ok(result);
        }

        /// <summary>
        /// Bir müşteriyi siler. Faturası olan müşteriler silinemez.
        /// </summary>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
        [ProducesResponseType(typeof(ApiResponse<bool>), 404)]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var result = await _customerService.DeleteAsync(id);
            if (!result.Success)
                return result.Message.Contains("bulunamadı") ? NotFound(result) : BadRequest(result);
            return Ok(result);
        }
    }
}
