using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendancesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AttendancesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn(int empId, string workMode)
        {
            var employee = await _context.Employees.FindAsync(empId);

            if (employee == null)
                return NotFound("Employee not found");

            var today = DateTime.Now.Date;

            var existingAttendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.EmpId == empId && a.AttendanceDate == today);

            if (existingAttendance != null)
                return BadRequest("Employee already checked in today");

            var attendance = new Attendance
            {
                EmpId = empId,
                CheckIn = DateTime.Now,
                AttendanceDate = today,
                WorkMode = workMode
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();

            return Ok(attendance);
        }

        [HttpPost("check-out")]
        public async Task<IActionResult> CheckOut(int empId)
        {
            var today = DateTime.Now.Date;

            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.EmpId == empId && a.AttendanceDate == today);

            if (attendance == null)
                return NotFound("Check-in record not found");

            if (attendance.CheckOut != null)
                return BadRequest("Employee already checked out today");

            attendance.CheckOut = DateTime.Now;
            attendance.TotalHours = Math.Round(
                (attendance.CheckOut.Value - attendance.CheckIn).TotalHours, 2);

            await _context.SaveChangesAsync();

            return Ok(attendance);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAttendance()
        {
            var records = await _context.Attendances
                .Include(a => a.Employee)
                .ToListAsync();

            return Ok(records);
        }

        [HttpGet("employee/{empId}")]
        public async Task<IActionResult> GetAttendanceByEmployee(int empId)
        {
            var records = await _context.Attendances
                .Where(a => a.EmpId == empId)
                .OrderByDescending(a => a.AttendanceDate)
                .ToListAsync();

            return Ok(records);
        }

        [HttpGet("monthly")]
        public async Task<IActionResult> GetMonthlyAttendance(int empId, int month, int year)
        {
            var records = await _context.Attendances
                .Where(a => a.EmpId == empId &&
                            a.AttendanceDate.Month == month &&
                            a.AttendanceDate.Year == year)
                .OrderBy(a => a.AttendanceDate)
                .ToListAsync();

            return Ok(records);
        }
    }
}