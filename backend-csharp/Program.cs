// Backend C# .NET 8 WebAPI con SignalR para Sincronización en Tiempo Real de Restaurantes
using Microsoft.AspNetCore.SignalR;
using Amazon.S3;
using Amazon.S3.Model;

var builder = WebApplication.CreateBuilder(args);

// Configuración de SignalR para WebSocket con Tablets Android, KDS y All-in-One Touch
builder.Services.AddSignalR();
builder.Services.AddCors(options => {
    options.AddPolicy("CorsPolicy", policy =>
        policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(_ => true));
});

// Configuración de Cliente S3 MinIO para almacenamiento de imágenes de productos y menús
builder.Services.AddSingleton<IAmazonS3>(sp => {
    var s3Config = new AmazonS3Config {
        ServiceURL = builder.Configuration["AWS:ServiceURL"] ?? "http://minio-s3:9000",
        ForcePathStyle = true
    };
    return new AmazonS3Client("minio_resto_admin", "minio_resto_secret_2026", s3Config);
});

var app = builder.Build();
app.UseCors("CorsPolicy");

// Hub SignalR para sincronización omnicanal inmediata
app.MapHub<RestaurantHub>("/hubs/restaurant");

// Endpoints RESTful
app.MapPost("/api/orders/transmit", async (OrderDto order, IHubContext<RestaurantHub> hub) => {
    // Transmitir orden automáticamente a KDS (Chef Rodrigo) y Tablets
    await hub.Clients.Group("KitchenDisplay").SendAsync("NewOrderReceived", order);
    return Results.Ok(new { success = true, orderId = order.Id });
});

app.MapPost("/api/media/upload", async (IFormFile file, IAmazonS3 s3Client) => {
    var key = $"dishes/{Guid.NewGuid()}_{file.FileName}";
    using var stream = file.OpenReadStream();
    var putRequest = new PutObjectRequest {
        BucketName = "restaurant-media",
        Key = key,
        InputStream = stream,
        ContentType = file.ContentType
    };
    await s3Client.PutObjectAsync(putRequest);
    return Results.Ok(new { url = $"http://localhost:9000/restaurant-media/{key}" });
});

app.Run();

public class RestaurantHub : Hub {
    public async Task JoinStationGroup(string station) =>
        await Groups.AddToGroupAsync(Context.ConnectionId, station);
}

public record OrderDto(string Id, int OrderNumber, string Channel, decimal Total, List<object> Items);
