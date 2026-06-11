using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("monthly-attendance")]
        public async Task<IActionResult> MonthlyAttendanceReport(int month, int year)
        {
            var report = await _context.Attendances
                .Include(a => a.Employee)
                .Where(a => a.AttendanceDate.Month == month &&
                            a.AttendanceDate.Year == year)
                .Select(a => new
                {
                    a.AttendanceId,
                    a.EmpId,
                    EmployeeName = a.Employee != null
                        ? a.Employee.FirstName + " " + a.Employee.LastName
                        : "",
                    a.AttendanceDate,
                    a.CheckIn,
                    a.CheckOut,
                    a.TotalHours,
                    a.WorkMode
                })
                .ToListAsync();

            return Ok(report);
        }

        [HttpGet("leave-report")]
        public async Task<IActionResult> LeaveReport()
        {
            var report = await _context.Leaves
                .Include(l => l.Employee)
                .Select(l => new
                {
                    l.LeaveId,
                    l.EmployeeId,
                    EmployeeName = l.Employee != null
                        ? l.Employee.FirstName + " " + l.Employee.LastName
                        : "",
                    l.LeaveType,
                    l.Reason,
                    l.FromDate,
                    l.ToDate,
                    l.Status,
                    l.AppliedOn,
                    l.ApprovedBy,
                    l.ApprovedOn
                })
                .ToListAsync();

            return Ok(report);
        }

        [HttpGet("employee-report")]
        public async Task<IActionResult> EmployeeReport()
        {
            var report = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Role)
                .Select(e => new
                {
                    e.EmployeeId,
                    EmployeeName = e.FirstName + " " + e.LastName,
                    e.Email,
                    e.PhoneNumber,
                    Department = e.Department != null
                        ? e.Department.DepartmentName
                        : "",
                    Role = e.Role != null
                        ? e.Role.RoleName
                        : "",
                    e.Status,
                    e.DOJ
                })
                .ToListAsync();

            return Ok(report);
        }

        [HttpGet("project-allocation-report")]
        public async Task<IActionResult> ProjectAllocationReport()
        {
            var report = await _context.EmployeeProjectAllocations
                .Include(a => a.Employee)
                .Include(a => a.Project)
                .Select(a => new
                {
                    a.AllocationId,
                    a.EmployeeId,
                    EmployeeName = a.Employee != null
                        ? a.Employee.FirstName + " " + a.Employee.LastName
                        : "",
                    a.ProjectId,
                    ProjectName = a.Project != null
                        ? a.Project.ProjectName
                        : "",
                    a.AssignedOn,
                    a.CreatedBy,
                    a.Status
                })
                .ToListAsync();

            return Ok(report);
        }
    }
}