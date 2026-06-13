using System.ComponentModel.DataAnnotations;
using WMS.Domain.Common;

namespace WMS.Domain.Entities
{
    public class AuditLog
    {
        [Key]
        public int AuditId { get; set; }

        public string EntityName { get; set; } = string.Empty;

        public int RecordId { get; set; }

        [MaxLength(20)]
        public string Action { get; set; } = string.Empty;

        public int CreatedBy { get; set; }

        public DateTime CreatedOn { get; set; } = DateTimeHelper.Now;
    }
}