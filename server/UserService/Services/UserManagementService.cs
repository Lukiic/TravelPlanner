using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using UserService.Data;
using UserService.DTOs;
using UserService.Models;

namespace UserService.Services
{
    public class UserManagementService
    {
        private readonly UserDbContext _db;
        private readonly IMapper _mapper;

        public UserManagementService(UserDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<List<UserDto>> GetAllUsersAsync()
            => _mapper.Map<List<UserDto>>(await _db.Users.ToListAsync());

        public async Task<UserDto> GetUserByIdAsync(Guid id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException("User not found.");
            return _mapper.Map<UserDto>(user);
        }

        public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserRequestDto dto)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException("User not found.");

            if (dto.Name != null) user.Name = dto.Name;
            if (dto.Email != null) user.Email = dto.Email;

            await _db.SaveChangesAsync();

            return _mapper.Map<UserDto>(user);
        }

        public async Task DeleteUserAsync(Guid id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException("User not found.");

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
        }

        public async Task<UserDto> CreateUserAsync(CreateUserRequestDto dto)
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
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return _mapper.Map<UserDto>(user);
        }
    }
}
