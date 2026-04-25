using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace SharingService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    internal sealed class SharingService : StatefulService, ISharingService
    {
        private readonly SharingServiceImpl _sharingServiceImpl;

        public SharingService(StatefulServiceContext context) : base(context)
        {
            _sharingServiceImpl = new SharingServiceImpl(StateManager);
        }

        // Register the remoting listener
        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
            => this.CreateServiceRemotingReplicaListeners();

        public Task<string> CreateShareTokenAsync(Guid travelPlanId, string accessType)
            => _sharingServiceImpl.CreateShareTokenAsync(travelPlanId, accessType);

        public Task<SharingTokenDto> ValidateTokenAsync(string token)
            => _sharingServiceImpl.ValidateTokenAsync(token);

        public Task RevokeTokenAsync(string token)
            => _sharingServiceImpl.RevokeTokenAsync(token);

        public Task<List<SharingTokenDto>> GetTokensForPlanAsync(Guid travelPlanId)
            => _sharingServiceImpl.GetTokensForPlanAsync(travelPlanId);

        protected override Task RunAsync(CancellationToken cancellationToken)
        {
            // No background work needed because remoting listener handles all calls
            return Task.CompletedTask;
        }
    }
}
