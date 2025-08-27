using System.Text.Json;

namespace backend.Models
{
    public class DocumentContent
    {
        // List of blocks: text, image, video, etc.
        public List<ContentBlock> Blocks { get; set; } = new();

        public string ToJson() => JsonSerializer.Serialize(this);

        public static DocumentContent FromJson(string json) =>
            JsonSerializer.Deserialize<DocumentContent>(json) ?? new DocumentContent();
    }

    public class ContentBlock
    {
        // Block type: "text", "image", "video", etc.
        public string Type { get; set; } = "text";

        // Data can be any JSON object, like {"text":"Hello"} or {"url":"..."}
        public JsonElement Data { get; set; }
    }
}
