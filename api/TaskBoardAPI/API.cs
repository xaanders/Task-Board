namespace TaskBoardAPI;

public static class API
{
    public static void ConfigureApi(this WebApplication app) 
    {
        app.Use(async (context, next) =>
        {
            // ...
            Console.WriteLine($"Request: {context.Request.Path}{context.Request.QueryString}");
            //
            await next(context);
        });

        app.MapGet("/api/universal", async (HttpRequest request, Backend backend) => await backend.Universal(request));

        app.MapPost("/api/universal", async (HttpRequest request, Backend backend) => await backend.Universal(request));
        
        app.MapPut("/api/universal", async (HttpRequest request, Backend backend) => await backend.Universal(request));

        app.MapGet("/api/data", async (HttpRequest request, Backend backend) => await backend.GetAll(request));
    }
}
