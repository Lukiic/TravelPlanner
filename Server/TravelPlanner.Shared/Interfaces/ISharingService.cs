using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelPlanner.Shared.DTOs;

namespace TravelPlanner.Shared.Interfaces
{
    public interface ISharingService : IService
    {
        Task<string> CreateShareTokenAsync(Guid travelPlanId, string accessType);
        Task<SharingTokenDto> ValidateTokenAsync(string token);
        Task RevokeTokenAsync(string token);
        Task<List<SharingTokenDto>> GetTokensForPlanAsync(Guid travelPlanId);
    }
}
