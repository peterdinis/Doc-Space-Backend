using System.ComponentModel.DataAnnotations;
using backend.DTOs.Documents;

namespace backend.DTOs.DocumentTemplate
{

    public class DocumentTemplateDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DocumentContentDto Content { get; set; } = new();
    }
}