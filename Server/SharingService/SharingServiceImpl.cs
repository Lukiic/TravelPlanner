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
        private const string DictionaryName = "sharingTokens";

        public SharingServiceImpl(IReliableStateManager stateManager)
        {
            _stateManager = stateManager;
        }

        private async Task<IReliableDictionary<string, SharingTokenData>> GetDictionaryAsync()
            => await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingTokenData>>(DictionaryName);

        private static SharingTokenDto MapToDto(SharingTokenData data) => new()
        {
            Token = data.Token,
            TravelPlanId = data.TravelPlanId,
            AccessType = data.AccessType,
            CreatedAt = data.CreatedAt,
            ExpiresAt = data.ExpiresAt
        };

        public async Task<string> CreateShareTokenAsync(Guid travelPlanId, string accessType)
        {
            var dict = await GetDictionaryAsync();
            var token = Guid.NewGuid().ToString("N");

            var data = new SharingTokenData
            {
                Token = token,
                TravelPlanId = travelPlanId,
                AccessType = accessType.ToUpper(),
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = null
            };

            using var tx = _stateManager.CreateTransaction();
            await dict.AddOrUpdateAsync(tx, token, data, (k, v) => data);
            await tx.CommitAsync();

            return token;
        }

        public async Task<SharingTokenDto> ValidateTokenAsync(string token)
        {
            var dict = await GetDictionaryAsync();

            using var tx = _stateManager.CreateTransaction();
            var result = await dict.TryGetValueAsync(tx, token);

            if (!result.HasValue)
                throw new KeyNotFoundException("Token not found.");

            var data = result.Value;
            if (data.ExpiresAt.HasValue && data.ExpiresAt.Value < DateTime.UtcNow)
                throw new InvalidOperationException("Token has expired.");

            return MapToDto(data);
        }

        public async Task RevokeTokenAsync(string token)
        {
            var dict = await GetDictionaryAsync();

            using var tx = _stateManager.CreateTransaction();
            await dict.TryRemoveAsync(tx, token);
            await tx.CommitAsync();
        }

        public async Task<List<SharingTokenDto>> GetTokensForPlanAsync(Guid travelPlanId)
        {
            var dict = await GetDictionaryAsync();
            var results = new List<SharingTokenDto>();

            using var tx = _stateManager.CreateTransaction();
            var enumerable = await dict.CreateEnumerableAsync(tx);
            using var enumerator = enumerable.GetAsyncEnumerator();

            while (await enumerator.MoveNextAsync(CancellationToken.None))
            {
                var pair = enumerator.Current;

                if (pair.Value.TravelPlanId == travelPlanId)
                {
                    results.Add(MapToDto(pair.Value));
                }
            }

            return results;
        }
    }
}
