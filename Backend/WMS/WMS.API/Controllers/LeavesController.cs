using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeavesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LeavesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("apply")]
        public async Task<IActionResult> ApplyLeave(Leave leave)
        {
            var employee = await _context.Employees.FindAsync(leave.EmployeeId);

            if (employee == null)
                return NotFound("Employee not found");

            if (leave.FromDate > leave.ToDate)
                return BadRequest("FromDate cannot be greater than ToDate");

            leave.Status = "Pending";
            leave.AppliedOn = DateTime.Now;

            _context.Leaves.Add(leave);
            await _context.SaveChangesAsync();

            return Ok(leave);
        }

        [HttpPut("cancel/{leaveId}")]
        public async Task<IActionResult> CancelLeave(int leaveId)
        {
            var leave = await _context.Leaves.FindAsync(leaveId);

            if (leave == null)
                return NotFound("Leave not found");

            if (leave.Status != "Pending")
                return BadRequest("Only pending leaves can be cancelled");

            leave.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return Ok(leave);
        }

        [HttpPut("approve/{leaveId}")]
        public async Task<IActionResult> ApproveLeave(int leaveId, int managerId)
        {
            var leave = await _context.Leaves.FindAsync(leaveId);

            if (leave == null)
                return NotFound("Leave not found");

            leave.Status = "Approved";
            leave.ApprovedBy = managerId;
            leave.ApprovedOn = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(leave);
        }

        [HttpPut("reject/{leaveId}")]
        public async Task<IActionResult> RejectLeave(int leaveId, int managerId)
        {
            var leave = await _context.Leaves.FindAsync(leaveId);

            if (leave == null)
                return NotFound("Leave not found");

            leave.Status = "Rejected";
            leave.ApprovedBy = managerId;
            leave.ApprovedOn = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(leave);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllLeaves()
        {
            var leaves = await _context.Leaves
                .Include(l => l.Employee)
                .ToListAsync();

            return Ok(leaves);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetEmployeeLeaves(int employeeId)
        {
            var leaves = await _context.Leaves
                .Where(l => l.EmployeeId == employeeId)
                .OrderByDescending(l => l.AppliedOn)
                .ToListAsync();

            return Ok(leaves);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingLeaves()
        {
            var leaves = await _context.Leaves
                .Where(l => l.Status == "Pending")
                .Include(l => l.Employee)
                .ToListAsync();

            return Ok(leaves);
        }
    }
}