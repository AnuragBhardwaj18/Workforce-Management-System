using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var today = DateTime.Today;

            var totalEmployees = await _context.Employees.CountAsync();

            var activeEmployees = await _context.Employees
                .CountAsync(e => e.Status == "Active");

            var totalDepartments = await _context.Departments.CountAsync();

            var presentToday = await _context.Attendances
                .CountAsync(a => a.AttendanceDate == today);

            var pendingLeaves = await _context.Leaves
                .CountAsync(l => l.Status == "Pending");

            var approvedLeaves = await _context.Leaves
                .CountAsync(l => l.Status == "Approved");

            var activeProjects = await _context.Projects
                .CountAsync(p => p.Status == "Active");

            var totalProjects = await _context.Projects.CountAsync();

            return Ok(new
            {
                TotalEmployees = totalEmployees,
                ActiveEmployees = activeEmployees,
                TotalDepartments = totalDepartments,
                PresentToday = presentToday,
                PendingLeaves = pendingLeaves,
                ApprovedLeaves = approvedLeaves,
                ActiveProjects = activeProjects,
                TotalProjects = totalProjects
            });
        }

        [HttpGet("leave-statistics")]
        public async Task<IActionResult> GetLeaveStatistics()
        {
            var pending = await _context.Leaves.CountAsync(l => l.Status == "Pending");
            var approved = await _context.Leaves.CountAsync(l => l.Status == "Approved");
            var rejected = await _context.Leaves.CountAsync(l => l.Status == "Rejected");
            var cancelled = await _context.Leaves.CountAsync(l => l.Status == "Cancelled");

            return Ok(new
            {
                Pending = pending,
                Approved = approved,
                Rejected = rejected,
                Cancelled = cancelled
            });
        }

        [HttpGet("project-statistics")]
        public async Task<IActionResult> GetProjectStatistics()
        {
            var active = await _context.Projects.CountAsync(p => p.Status == "Active");
            var completed = await _context.Projects.CountAsync(p => p.Status == "Completed");

            return Ok(new
            {
                Active = active,
                Completed = completed
            });
        }
    }
}