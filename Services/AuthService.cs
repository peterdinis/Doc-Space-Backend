using backend.Data;
using backend.DTOs.User;
using backend.Models;

namespace backend.Services
{
    public class AuthService
    {
        private readonly AppDbContext _db;

        public AuthService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<User> RegisterAsync(RegisterDto dto)
        {
            // Check if user already exists
            var existingUser = _db.Users.FirstOrDefault(u => u.Email == dto.Email || u.Username == dto.Username);
            if (existingUser != null)
            {
                throw new InvalidOperationException("User with this email or username already exists.");
            }

            // Create new user with hashed password
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return user;
        }

        public User? Login(LoginDto dto)
        {
            var user = _db.Users.FirstOrDefault(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return null;
            }

            return user;
        }

        public User? GetUserById(int id)
        {
            return _db.Users.FirstOrDefault(u => u.Id == id);
        }
    }
}
