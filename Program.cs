using backend.Data;
using Microsoft.EntityFrameworkCore;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddScoped<DocumentService>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=googledocs.db"));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();
app.MapControllers();

app.Run();
