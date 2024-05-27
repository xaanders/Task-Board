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

        app.MapPost("/api/register", async (HttpRequest request, IAmazonCognitoIdentityProvider cognitoClient, Auth auth) => 
            await auth.AuthUniversal(request, cognitoClient, "SignUp"));

        app.MapPost("/api/confirm-email", async (HttpRequest request, IAmazonCognitoIdentityProvider cognitoClient, Auth auth) =>
            await auth.AuthUniversal(request, cognitoClient, "ConfirmEmail"));

        app.MapPost("/api/resend-code", async (HttpRequest request, IAmazonCognitoIdentityProvider cognitoClient, Auth auth) =>
            await auth.AuthUniversal(request, cognitoClient, "ResendCode"));

        app.MapPost("/api/signin", async (HttpRequest request, IAmazonCognitoIdentityProvider cognitoClient, Auth auth) => 
            await auth.AuthUniversal(request, cognitoClient, "SignIn"));
    }
}
