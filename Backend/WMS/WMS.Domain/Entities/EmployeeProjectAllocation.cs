using System.ComponentModel.DataAnnotations;
using WMS.Domain.Common;

namespace WMS.Domain.Entities
{
    public class EmployeeProjectAllocation
    {
        [Key]
        public int AllocationId { get; set; }

        public int EmployeeId { get; set; }

        public int ProjectId { get; set; }

        public DateTime AssignedOn { get; set; }

        public DateTime CreateDate { get; set; } = DateTimeHelper.Now;

        [Required]
        [MaxLength(50)]
        public string CreatedBy { get; set; } = string.Empty;

        public bool Status { get; set; } = true;

        [MaxLength(50)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public Employee? Employee { get; set; }

        public Project? Project { get; set; }
    }
}