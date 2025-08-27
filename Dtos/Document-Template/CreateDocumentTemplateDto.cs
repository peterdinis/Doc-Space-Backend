using System.ComponentModel.DataAnnotations;
using backend.DTOs.Documents;

namespace backend.DTOs.DocumentTemplate
{
    public class DocumentTemplateCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public DocumentContentDto Content { get; set; } = new();
    }
}