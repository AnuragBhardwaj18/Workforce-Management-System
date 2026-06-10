using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectAllocationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProjectAllocationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllocations()
        {
            var allocations = await _context.EmployeeProjectAllocations
                .Include(a => a.Employee)
                .Include(a => a.Project)
                .ToListAsync();

            return Ok(allocations);
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignEmployee(EmployeeProjectAllocation allocation)
        {
            var employee = await _context.Employees.FindAsync(allocation.EmployeeId);
            if (employee == null)
                return NotFound("Employee not found");

            var project = await _context.Projects.FindAsync(allocation.ProjectId);
            if (project == null)
                return NotFound("Project not found");

            allocation.AssignedOn = DateTime.Now;
            allocation.CreateDate = DateTime.Now;
            allocation.Status = true;

            _context.EmployeeProjectAllocations.Add(allocation);
            await _context.SaveChangesAsync();

            return Ok(allocation);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetProjectsByEmployee(int employeeId)
        {
            var allocations = await _context.EmployeeProjectAllocations
                .Include(a => a.Project)
                .Where(a => a.EmployeeId == employeeId && a.Status == true)
                .ToListAsync();

            return Ok(allocations);
        }

        [HttpPut("remove/{allocationId}")]
        public async Task<IActionResult> RemoveAllocation(int allocationId, string updatedBy)
        {
            var allocation = await _context.EmployeeProjectAllocations.FindAsync(allocationId);

            if (allocation == null)
                return NotFound("Allocation not found");

            allocation.Status = false;
            allocation.UpdatedBy = updatedBy;
            allocation.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(allocation);
        }
    }
}