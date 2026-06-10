using System.ComponentModel.DataAnnotations;

namespace WMS.Domain.Entities
{
    public class Role
    {
        [Key]
        public int RoleId { get; set; }

        [Required]
        [MaxLength(50)]
        public string RoleName { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? Description { get; set; }
    }
}