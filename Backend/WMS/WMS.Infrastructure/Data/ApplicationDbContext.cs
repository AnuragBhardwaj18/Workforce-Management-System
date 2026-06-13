using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using WMS.Domain.Entities;
using WMS.Domain.Common;

namespace WMS.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        private readonly IHttpContextAccessor? _httpContextAccessor;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IHttpContextAccessor? httpContextAccessor = null)
            : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public DbSet<Role> Roles { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<UserLogin> UserLogins { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<Leave> Leaves { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<EmployeeProjectAllocation> EmployeeProjectAllocations { get; set; }
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            int currentEmployeeId = 0;
            try
            {
                var username = _httpContextAccessor?.HttpContext?.User?.Identity?.Name;
                if (!string.IsNullOrEmpty(username) && username != "admin@wms.com")
                {
                    var emp = this.Employees.FirstOrDefault(e => e.Email == username);
                    if (emp != null)
                    {
                        currentEmployeeId = emp.EmployeeId;
                    }
                }
            }
            catch
            {
                // Ignore error in user resolution
            }

            var auditEntries = new List<(AuditLog Log, Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry Entry)>();
            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                    continue;

                string action = entry.State switch
                {
                    EntityState.Added => "Insert",
                    EntityState.Modified => "Update",
                    EntityState.Deleted => "Delete",
                    _ => ""
                };

                if (string.IsNullOrEmpty(action)) continue;

                var entityName = entry.Entity.GetType().Name;
                if (entityName.Contains("Proxy"))
                {
                    entityName = entry.Entity.GetType().BaseType?.Name ?? entityName;
                }

                int recordId = 0;
                var keyProperty = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
                if (keyProperty != null && entry.State != EntityState.Added)
                {
                    if (keyProperty.CurrentValue is int intKey)
                    {
                        recordId = intKey;
                    }
                }

                var auditLog = new AuditLog
                {
                    EntityName = entityName,
                    RecordId = recordId,
                    Action = action,
                    CreatedBy = currentEmployeeId,
                    CreatedOn = DateTimeHelper.Now
                };
                auditEntries.Add((auditLog, entry));
            }

            int result = await base.SaveChangesAsync(cancellationToken);

            if (auditEntries.Count > 0)
            {
                foreach (var item in auditEntries)
                {
                    if (item.Log.RecordId == 0)
                    {
                        var keyProperty = item.Entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
                        if (keyProperty != null && keyProperty.CurrentValue is int intKey)
                        {
                            item.Log.RecordId = intKey;
                        }
                    }
                    this.AuditLogs.Add(item.Log);
                }
                await base.SaveChangesAsync(cancellationToken);
            }

            return result;
        }
    }
}