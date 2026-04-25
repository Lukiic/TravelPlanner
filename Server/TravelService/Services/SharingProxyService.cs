using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace TravelService.Services
{
    public class SharingProxyService
    {
        private readonly Uri _serviceUri = new("fabric:/TravelPlannerApp/SharingService");

        private ISharingService CreateProxy()
            => ServiceProxy.Create<ISharingService>(
                _serviceUri,
                new ServicePartitionKey(0)); // Singleton partition

        public Task<string> CreateTokenAsync(Guid travelPlanId, string accessType)
            => CreateProxy().CreateShareTokenAsync(travelPlanId, accessType);

        public Task<SharingTokenDto> ValidateTokenAsync(string token)
            => CreateProxy().ValidateTokenAsync(token);

        public Task RevokeTokenAsync(string token)
            => CreateProxy().RevokeTokenAsync(token);

        public Task<List<SharingTokenDto>> GetTokensForPlanAsync(Guid travelPlanId)
            => CreateProxy().GetTokensForPlanAsync(travelPlanId);
    }
}
