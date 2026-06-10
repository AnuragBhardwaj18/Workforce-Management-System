using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClientsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetClients()
        {
            return Ok(await _context.Clients.ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
                return NotFound("Client not found");

            return Ok(client);
        }

        [HttpPost]
        public async Task<IActionResult> AddClient(Client client)
        {
            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            return Ok(client);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClient(int id, Client client)
        {
            var existingClient = await _context.Clients.FindAsync(id);

            if (existingClient == null)
                return NotFound("Client not found");

            existingClient.ClientName = client.ClientName;
            existingClient.ClientAddress = client.ClientAddress;
            existingClient.ClientPhoneNumber = client.ClientPhoneNumber;
            existingClient.ClientLocation = client.ClientLocation;
            existingClient.Status = client.Status;

            await _context.SaveChangesAsync();

            return Ok(existingClient);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
                return NotFound("Client not found");

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();

            return Ok("Client deleted successfully");
        }
    }
}