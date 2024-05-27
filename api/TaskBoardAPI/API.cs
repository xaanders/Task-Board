using Amazon.CognitoIdentityProvider;

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

        app.MapGet("/api/universal", async (HttpRequest request, Backend backend) => await backend.Universal(request)).RequireAuthorization();

        app.MapPost("/api/universal", async (HttpRequest request, Backend backend) => await backend.Universal(request)).RequireAuthorization();
        
        app.MapPut("/api/universal", async (HttpRequest request, Backend backend) => await backend.Universal(request)).RequireAuthorization();

        app.MapGet("/api/data", async (HttpRequest request, Backend backend) => await backend.GetAll(request)).RequireAuthorization();

        app.MapPost("/api/register", async (HttpRequest request, IAmazonCognitoIdentityProvider cognitoClient, Auth auth) => await auth.InitiateSignUp(request, cognitoClient));
        
        //app.MapPost("/api/login", async (HttpRequest request, Backend backend) => await backend.GetAll(request)).RequireAuthorization();
    }
}
