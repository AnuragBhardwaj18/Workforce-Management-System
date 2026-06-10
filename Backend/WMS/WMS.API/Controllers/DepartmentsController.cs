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
        public async Task<IActionResult> AddDepartment(Department department)
        {
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
            return Ok(department);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(int id, Department department)
        {
            var existing = await _context.Departments.FindAsync(id);

            if (existing == null)
                return NotFound();

            existing.DepartmentName = department.DepartmentName;
            existing.Description = department.Description;

            await _context.SaveChangesAsync();

            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);

            if (department == null)
                return NotFound();

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            return Ok("Department deleted successfully");
        }
    }
}