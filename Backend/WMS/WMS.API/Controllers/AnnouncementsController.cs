using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Domain.Common;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnnouncementsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnnouncementsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAnnouncements()
        {
            return Ok(await _context.Announcements.ToListAsync());
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveAnnouncements()
        {
            var announcements = await _context.Announcements
                .Where(a => a.IsActive)
                .OrderByDescending(a => a.CreatedOn)
                .ToListAsync();

            return Ok(announcements);
        }

        [HttpPost]
        public async Task<IActionResult> AddAnnouncement(Announcement announcement)
        {
            announcement.CreatedOn = DateTimeHelper.Now;
            announcement.IsActive = true;

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            return Ok(announcement);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAnnouncement(int id, Announcement announcement)
        {
            var existing = await _context.Announcements.FindAsync(id);

            if (existing == null)
                return NotFound("Announcement not found");

            existing.Title = announcement.Title;
            existing.Message = announcement.Message;
            existing.IsActive = announcement.IsActive;

            await _context.SaveChangesAsync();

            return Ok(existing);
        }

        [HttpPut("deactivate/{id}")]
        public async Task<IActionResult> DeactivateAnnouncement(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);

            if (announcement == null)
                return NotFound("Announcement not found");

            announcement.IsActive = false;

            await _context.SaveChangesAsync();

            return Ok("Announcement deactivated successfully");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);

            if (announcement == null)
                return NotFound("Announcement not found");

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();

            return Ok("Announcement deleted successfully");
        }
    }
}