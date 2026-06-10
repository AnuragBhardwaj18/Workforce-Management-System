using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RolesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles.ToListAsync();
            return Ok(roles);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);

            if (role == null)
            {
                return NotFound("Role not found");
            }

            return Ok(role);
        }

        [HttpPost]
        public async Task<IActionResult> AddRole(Role role)
        {
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            return Ok(role);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(int id, Role role)
        {
            var existingRole = await _context.Roles.FindAsync(id);

            if (existingRole == null)
            {
                return NotFound("Role not found");
            }

            existingRole.RoleName = role.RoleName;
            existingRole.Description = role.Description;

            await _context.SaveChangesAsync();

            return Ok(existingRole);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);

            if (role == null)
            {
                return NotFound("Role not found");
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return Ok("Role deleted successfully");
        }
    }
}