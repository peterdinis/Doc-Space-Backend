namespace backend.Models
{
    public class DocumentContent
    {
        public string Text { get; set; } = string.Empty;
        public List<string> Images { get; set; } = new();
        public List<string> Videos { get; set; } = new();
    }
}
