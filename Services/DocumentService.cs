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

        public async Task<Document?> UpdateAsync(int id, DocumentUpdateDto dto)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Title))
                doc.Title = dto.Title;

            if (dto.Content != null)
                doc.Content = JsonSerializer.Serialize(dto.Content);

            doc.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return doc;
        }

        public async Task<Document?> GetByIdAsync(int id) =>
            await _context.Documents.FindAsync(id);

        public async Task<bool> DeleteAsync(int id)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return false;

            _context.Documents.Remove(doc);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Document>> GetAllAsync(DocumentQueryDto query)
        {
            var docs = _context.Documents.AsQueryable();

            if (query.OwnerId.HasValue)
                docs = docs.Where(d => d.OwnerId == query.OwnerId.Value);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                docs = docs.Where(d =>
                    d.Title.Contains(query.Search));
            }

            return await docs
                .OrderByDescending(d => d.UpdatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();
        }
    }
}
