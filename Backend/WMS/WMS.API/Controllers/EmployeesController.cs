using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmployeesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetEmployees()
        {
            var employees = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Role)
                .ToListAsync();

            return Ok(employees);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEmployee(int id)
        {
            var employee = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Role)
                .FirstOrDefaultAsync(e => e.EmployeeId == id);

            if (employee == null)
            {
                return NotFound("Employee not found");
            }

            return Ok(employee);
        }

        [HttpPost]
        public async Task<IActionResult> AddEmployee(Employee employee)
        {
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            // Automatically create corresponding UserLogin record
            var userLogin = new UserLogin
            {
                Username = employee.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Wms@123"), // Default password
                RoleId = employee.RoleId
            };
            _context.UserLogins.Add(userLogin);
            await _context.SaveChangesAsync();

            return Ok(employee);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, Employee employee)
        {
            var existingEmployee = await _context.Employees.FindAsync(id);

            if (existingEmployee == null)
            {
                return NotFound("Employee not found");
            }

            var oldEmail = existingEmployee.Email;

            existingEmployee.FirstName = employee.FirstName;
            existingEmployee.LastName = employee.LastName;
            existingEmployee.Email = employee.Email;
            existingEmployee.PhoneNumber = employee.PhoneNumber;
            existingEmployee.Gender = employee.Gender;
            existingEmployee.DOB = employee.DOB;
            existingEmployee.DOJ = employee.DOJ;
            existingEmployee.DepartmentId = employee.DepartmentId;
            existingEmployee.RoleId = employee.RoleId;
            existingEmployee.Status = employee.Status;
            existingEmployee.UpdatedOn = DateTime.Now;

            // Sync UserLogin record
            var userLogin = await _context.UserLogins.FirstOrDefaultAsync(u => u.Username == oldEmail);
            if (userLogin != null)
            {
                userLogin.Username = employee.Email;
                userLogin.RoleId = employee.RoleId;
            }

            await _context.SaveChangesAsync();

            return Ok(existingEmployee);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
            {
                return NotFound("Employee not found");
            }

            // Sync UserLogin record
            var userLogin = await _context.UserLogins.FirstOrDefaultAsync(u => u.Username == employee.Email);
            if (userLogin != null)
            {
                _context.UserLogins.Remove(userLogin);
            }

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();

            return Ok("Employee deleted successfully");
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchEmployee(string keyword)
        {
            var employees = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Role)
                .Where(e =>
                    e.FirstName.Contains(keyword) ||
                    e.LastName.Contains(keyword) ||
                    e.Email.Contains(keyword) ||
                    e.Department.DepartmentName.Contains(keyword) ||
                    e.Role.RoleName.Contains(keyword))
                .ToListAsync();

            return Ok(employees);
        }
    }
}