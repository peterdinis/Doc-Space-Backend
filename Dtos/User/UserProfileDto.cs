using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.User
{
     public class UserProfileDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = "";
        public string Email { get; set; } = "";
    }
}