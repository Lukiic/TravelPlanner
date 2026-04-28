using AutoMapper;
using TravelPlanner.Shared.DTOs;
using UserService.Models;

namespace UserService.Mappings
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {
            CreateMap<User, UserDto>();
        }
    }
}
