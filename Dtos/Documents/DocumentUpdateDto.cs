using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Documents
{
    public class DocumentUpdateDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        public DocumentContentDto? Content { get; set; }
    }
}