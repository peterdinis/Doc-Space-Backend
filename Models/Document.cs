using System.Text.Json;


namespace backend.Models
{

    public class Document
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = "{}"; // JSON string

        public int OwnerId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Helpers to get/set JSON content
        public DocumentContent GetContent() => JsonSerializer.Deserialize<DocumentContent>(Content)!;
        public void SetContent(DocumentContent data) => Content = JsonSerializer.Serialize(data);
    }
}
