using backend.Data;
using backend.Models;
using System.Text.Json;

namespace backend.Seeders
{
    public static class DatabaseSeeder
    {
        public static void Seed(AppDbContext context)
        {
            // --- Seed Document Templates ---
            if (!context.DocumentTemplates.Any())
            {
                var templates = new List<DocumentTemplate>
                {
                    new DocumentTemplate
                    {
                        Name = "Blank Document",
                        Description = "Start from scratch",
                        Content = JsonSerializer.Serialize(new DocumentContent
                        {
                            Text = "",
                            Images = new List<string>(),
                            Videos = new List<string>()
                        })
                    },
                    new DocumentTemplate
                    {
                        Name = "Meeting Notes",
                        Description = "Template for structured meeting notes",
                        Content = JsonSerializer.Serialize(new DocumentContent
                        {
                            Text = "Meeting Notes\n\nDate:\nAttendees:\nAgenda:\n\nNotes:",
                            Images = new List<string>(),
                            Videos = new List<string>()
                        })
                    },
                    new DocumentTemplate
                    {
                        Name = "Project Plan",
                        Description = "Template for project planning",
                        Content = JsonSerializer.Serialize(new DocumentContent
                        {
                            Text = "Project Plan\n\nObjectives:\nTimeline:\nTasks:\nRisks:\n",
                            Images = new List<string>(),
                            Videos = new List<string>()
                        })
                    }
                };

                context.DocumentTemplates.AddRange(templates);
                context.SaveChanges();
            }

            // --- Seed Documents ---
            if (!context.Documents.Any())
            {
                var documents = new List<Document>
                {
                    new Document
                    {
                        Title = "My First Document",
                        OwnerId = 1,
                        Content = JsonSerializer.Serialize(new DocumentContent
                        {
                            Text = "Hello, this is my first document!",
                            Images = new List<string>(),
                            Videos = new List<string>()
                        })
                    },
                    new Document
                    {
                        Title = "Weekly Meeting Notes",
                        OwnerId = 2,
                        Content = JsonSerializer.Serialize(new DocumentContent
                        {
                            Text = "Weekly Meeting Notes\n\nDate: 2025-08-27\nAttendees: Alice, Bob\nAgenda:\n- Review\n- Planning",
                            Images = new List<string>(),
                            Videos = new List<string>()
                        })
                    },
                    new Document
                    {
                        Title = "Project Plan for Q3",
                        OwnerId = 1,
                        Content = JsonSerializer.Serialize(new DocumentContent
                        {
                            Text = "Project Plan Q3\n\nObjectives:\n- Increase revenue\n- Launch new features\nTimeline:\n- July - Research\n- August - Development\n- September - Testing",
                            Images = new List<string> { "https://example.com/diagram.png" },
                            Videos = new List<string>()
                        })
                    }
                };

                context.Documents.AddRange(documents);
                context.SaveChanges();
            }
        }
    }
}
