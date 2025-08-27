using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Documents
{
    public class DocumentCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int OwnerId { get; set; }

        [Required]
        public DocumentContentDto Content { get; set; } = new();
    }
}