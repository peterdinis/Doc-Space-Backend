using backend.DTOs.DocumentTemplate;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentTemplatesController(DocumentTemplateService service) : ControllerBase
    {
        private readonly DocumentTemplateService _service = service;

        [HttpGet]
        public async Task<ActionResult<List<DocumentTemplate>>> GetAll()
        {
            var templates = await _service.GetAllAsync();
            return Ok(templates);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentTemplate>> GetById(int id)
        {
            var template = await _service.GetByIdAsync(id);
            if (template == null) return NotFound();
            return Ok(template);
        }

        [HttpPost]
        public async Task<ActionResult<DocumentTemplate>> Create([FromBody] DocumentTemplateCreateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
