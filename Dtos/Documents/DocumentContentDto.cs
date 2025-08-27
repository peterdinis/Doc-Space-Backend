using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace backend.DTOs.Documents
{
    public class DocumentContentDto
    {
        [Required]
        public List<ContentBlockDto> Blocks { get; set; } = new();
    }

    public class ContentBlockDto
    {
        [Required]
        public string Type { get; set; } = "text";

        [Required]
        public JsonElement Data { get; set; }
    }
}
