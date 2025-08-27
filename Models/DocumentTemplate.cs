using System.Text.Json;

namespace backend.Models
{
    public class DocumentTemplate
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;  // Template name
        public string Description { get; set; } = string.Empty; // Optional description

        // JSON content of the template
        public string Content { get; set; } = "{}";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Helpers to get/set content
        public DocumentContent GetContent() => JsonSerializer.Deserialize<DocumentContent>(Content)!;
        public void SetContent(DocumentContent data) => Content = JsonSerializer.Serialize(data);
    }
}
