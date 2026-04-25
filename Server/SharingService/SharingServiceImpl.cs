using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace SharingService
{
    public class SharingServiceImpl : ISharingService
    {
        private readonly IReliableStateManager _stateManager;

        public SharingServiceImpl(IReliableStateManager stateManager)
        {
            _stateManager = stateManager;
        }

        public async Task<string> CreateShareTokenAsync(Guid travelPlanId, string accessType)
        {
            var tokens = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingTokenDto>>("sharingTokens");
            var token = Guid.NewGuid().ToString("N");

            var dto = new SharingTokenDto
            {
                Token = token,
                TravelPlanId = travelPlanId,
                AccessType = accessType.ToUpper(),
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = null
            };

            using var tx = _stateManager.CreateTransaction();
            await tokens.AddOrUpdateAsync(tx, token, dto, (k, v) => dto);
            await tx.CommitAsync();

            return token;
        }

        public async Task<SharingTokenDto> ValidateTokenAsync(string token)
        {
            var tokens = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingTokenDto>>("sharingTokens");

            using var tx = _stateManager.CreateTransaction();
            var result = await tokens.TryGetValueAsync(tx, token);

            if (!result.HasValue)
                throw new KeyNotFoundException("Token not found.");

            var dto = result.Value;
            if (dto.ExpiresAt.HasValue && dto.ExpiresAt.Value < DateTime.UtcNow)
                throw new InvalidOperationException("Token has expired.");

            return dto;
        }

        public async Task RevokeTokenAsync(string token)
        {
            var tokens = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingTokenDto>>("sharingTokens");

            using var tx = _stateManager.CreateTransaction();
            await tokens.TryRemoveAsync(tx, token);
            await tx.CommitAsync();
        }

        public async Task<List<SharingTokenDto>> GetTokensForPlanAsync(Guid travelPlanId)
        {
            var tokens = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingTokenDto>>("sharingTokens");
            var result = new List<SharingTokenDto>();

            using var tx = _stateManager.CreateTransaction();
            var enumerable = await tokens.CreateEnumerableAsync(tx);
            var enumerator = enumerable.GetAsyncEnumerator();

            while (await enumerator.MoveNextAsync(CancellationToken.None))
            {
                if (enumerator.Current.Value.TravelPlanId == travelPlanId)
                    result.Add(enumerator.Current.Value);
            }

            return result;
        }
    }
}
