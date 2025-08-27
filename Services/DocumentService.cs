using backend.Data;
using backend.Models;
using backend.DTOs.Documents;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend.Services
{
    public class DocumentService
    {
        private readonly AppDbContext _context;
        public DocumentService(AppDbContext context) => _context = context;

        // Create
        public async Task<Document> CreateAsync(DocumentCreateDto dto)
        {
            var doc = new Document
            {
                Title = dto.Title,
                OwnerId = dto.OwnerId,
                Content = JsonSerializer.Serialize(dto.Content)
            };

            _context.Documents.Add(doc);
            await _context.SaveChangesAsync();
            return doc;
        }

        // Read by Id
        public async Task<Document?> GetByIdAsync(int id)
        {
            return await _context.Documents.FindAsync(id);
        }

        // Update
        public async Task<Document?> UpdateAsync(int id, DocumentUpdateDto dto)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Title))
                doc.Title = dto.Title;

            if (dto.Content != null)
                doc.SetContent(new DocumentContent
                {
                    Text = dto.Content.Text,
                    Images = dto.Content.Images,
                    Videos = dto.Content.Videos
                });

            doc.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return doc;
        }

        // Delete
        public async Task<bool> DeleteAsync(int id)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return false;

            _context.Documents.Remove(doc);
            await _context.SaveChangesAsync();
            return true;
        }

        // List with pagination, search, filter
        public async Task<List<Document>> GetAllAsync(DocumentQueryDto query)
        {
            var docs = _context.Documents.AsQueryable();

            if (query.OwnerId.HasValue)
                docs = docs.Where(d => d.OwnerId == query.OwnerId.Value);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                docs = docs.Where(d =>
                    d.Title.Contains(query.Search) ||
                    d.GetContent().Text.Contains(query.Search));
            }

            return await docs
                .OrderByDescending(d => d.UpdatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();
        }
    }
}
