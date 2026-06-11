using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditLogsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuditLogsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAuditLogs()
        {
            var logs = await _context.AuditLogs
                .OrderByDescending(a => a.CreatedOn)
                .ToListAsync();

            return Ok(logs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAuditLog(int id)
        {
            var log = await _context.AuditLogs.FindAsync(id);

            if (log == null)
                return NotFound("Audit log not found");

            return Ok(log);
        }

        [HttpGet("entity/{entityName}")]
        public async Task<IActionResult> GetLogsByEntity(string entityName)
        {
            var logs = await _context.AuditLogs
                .Where(a => a.EntityName == entityName)
                .OrderByDescending(a => a.CreatedOn)
                .ToListAsync();

            return Ok(logs);
        }

        [HttpPost]
        public async Task<IActionResult> AddAuditLog(AuditLog auditLog)
        {
            auditLog.CreatedOn = DateTime.Now;

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            return Ok(auditLog);
        }
    }
}