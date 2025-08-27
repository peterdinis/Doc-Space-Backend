namespace backend.DTOs.Documents
{
    public class DocumentQueryDto
    {
        public int? OwnerId { get; set; }
        public string? Search { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}