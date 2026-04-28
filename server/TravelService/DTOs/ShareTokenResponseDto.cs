namespace TravelService.DTOs
{
    public class ShareTokenResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string QrCode { get; set; } = string.Empty; // Base64-encoded PNG
        public string AccessType { get; set; } = string.Empty;
    }
}
