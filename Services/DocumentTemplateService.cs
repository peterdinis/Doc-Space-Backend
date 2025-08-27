using backend.Data;
using backend.Models;
using backend.DTOs.DocumentTemplate;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend.Services
{
    public class DocumentTemplateService
    {
        private readonly AppDbContext _context;
        public DocumentTemplateService(AppDbContext context) => _context = context;

        public async Task<List<DocumentTemplate>> GetAllAsync()
        {
            return await _context.DocumentTemplates
                .OrderBy(t => t.Name)
                .ToListAsync();
        }

        public async Task<DocumentTemplate?> GetByIdAsync(int id)
        {
            return await _context.DocumentTemplates.FindAsync(id);
        }

        public async Task<DocumentTemplate> CreateAsync(DocumentTemplateCreateDto dto)
        {
            var template = new DocumentTemplate
            {
                Name = dto.Name,
                Description = dto.Description,
                Content = JsonSerializer.Serialize(dto.Content)
            };

            _context.DocumentTemplates.Add(template);
            await _context.SaveChangesAsync();
            return template;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var template = await _context.DocumentTemplates.FindAsync(id);
            if (template == null) return false;

            _context.DocumentTemplates.Remove(template);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
