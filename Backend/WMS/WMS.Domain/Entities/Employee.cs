using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Domain.Entities
{
    public class Employee
    {
        [Key]
        public int EmployeeId { get; set; }

        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(80)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(15)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(1)]
        public string Gender { get; set; } = string.Empty;

        [Required]
        public DateTime DOB { get; set; }

        [Required]
        public DateTime DOJ { get; set; }

        public int DepartmentId { get; set; }

        public int RoleId { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        public DateTime CreatedOn { get; set; } = DateTime.Now;

        public DateTime? UpdatedOn { get; set; }

        public Department? Department { get; set; }

        public Role? Role { get; set; }
    }
}