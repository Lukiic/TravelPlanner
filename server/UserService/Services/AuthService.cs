using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using UserService.Data;
using UserService.DTOs;
using UserService.Models;

namespace UserService.Services
{
    public class AuthService
    {
        private readonly UserDbContext _db;
        private readonly JwtService _jwt;
        private readonly IMapper _mapper;

        public AuthService(UserDbContext db, JwtService jwt, IMapper mapper)
        {
            _db = db;
            _jwt = jwt;
            _mapper = mapper;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
        {
            var exists = await _db.Users.AnyAsync(u => u.Email == dto.Email);
            if (exists)
                throw new InvalidOperationException("Email already in use.");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "User",
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return new AuthResponseDto
            {
                Token = _jwt.GenerateToken(user),
                User = _mapper.Map<UserDto>(user)
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email)
                ?? throw new UnauthorizedAccessException("Invalid credentials.");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid credentials.");

            return new AuthResponseDto
            {
                Token = _jwt.GenerateToken(user),
                User = _mapper.Map<UserDto>(user)
            };
        }
    }
}
