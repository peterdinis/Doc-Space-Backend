using backend.DTOs.Documents;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController(DocumentService documentService) : ControllerBase
    {
        private readonly DocumentService _documentService = documentService;

        // GET: api/documents
        [HttpGet]
        public async Task<ActionResult<List<Document>>> GetAll([FromQuery] DocumentQueryDto query)
        {
            var documents = await _documentService.GetAllAsync(query);
            return Ok(documents);
        }

        // GET: api/documents/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Document>> GetById(int id)
        {
            var doc = await _documentService.GetByIdAsync(id);
            if (doc == null) return NotFound();
            return Ok(doc);
        }

        // POST: api/documents
        [HttpPost]
        public async Task<ActionResult<Document>> Create([FromBody] DocumentCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var created = await _documentService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT: api/documents/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<Document>> Update(int id, [FromBody] DocumentUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var updated = await _documentService.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        // DELETE: api/documents/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await _documentService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
