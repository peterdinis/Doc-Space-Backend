using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Document> Documents => Set<Document>();

        public DbSet<DocumentTemplate> DocumentTemplates => Set<DocumentTemplate>();
    }
}