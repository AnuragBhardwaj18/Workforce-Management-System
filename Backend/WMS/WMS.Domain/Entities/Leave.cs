using System.ComponentModel.DataAnnotations;
using WMS.Domain.Common;

namespace WMS.Domain.Entities
{
    public class Leave
    {
        [Key]
        public int LeaveId { get; set; }

        public int EmployeeId { get; set; }

        [Required]
        [MaxLength(30)]
        public string LeaveType { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Reason { get; set; }

        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Pending";

        public DateTime AppliedOn { get; set; } = DateTimeHelper.Now;

        public int? ApprovedBy { get; set; }

        public DateTime? ApprovedOn { get; set; }

        public Employee? Employee { get; set; }
    }
}