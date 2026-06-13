using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DepartmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDepartments()
        {
            return Ok(await _context.Departments.ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> AddDepartment([FromBody] DepartmentRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.departmentName))
            {
                return BadRequest("Department name is required");
            }

            var department = new Department
            {
                DepartmentName = request.departmentName,
                Description = request.description,
                CreatedOn = DateTime.Now
            };

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            return Ok(department);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(int id, [FromBody] DepartmentRequest request)
        {
            var existing = await _context.Departments.FindAsync(id);

            if (existing == null)
                return NotFound("Department not found");

            existing.DepartmentName = request.departmentName;
            existing.Description = request.description;

            await _context.SaveChangesAsync();

            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);

            if (department == null)
                return NotFound("Department not found");

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            return Ok("Department deleted successfully");
        }
    }

    public class DepartmentRequest
    {
        public string departmentName { get; set; } = string.Empty;
        public string? description { get; set; }
    }
}