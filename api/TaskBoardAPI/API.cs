using Amazon.CognitoIdentityProvider;
using Amazon.Runtime.Internal;

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

        app.MapPost("/api/register", async (HttpContext httpContext, HttpRequest request, IAmazonCognitoIdentityProvider cognitoClient, Auth auth) =>
            await auth.AuthUniversal(request, cognitoClient, "SignUp", httpContext));

        app.MapPost("/api/confirm-email", async (HttpContext httpContext, HttpRequest request, IAmazonCognitoIdentityProvider cognitoClient, Auth auth) =>
            await auth.AuthUniversal(request, cognitoClient, "ConfirmEmail", httpContext));

        app.MapPost("/api/resend-code", async (HttpContext httpContext, HttpRequest request, IAmazonCognitoIdentityProvider cognitoClient, Auth auth) =>
            await auth.AuthUniversal(request, cognitoClient, "ResendCode", httpContext));

        app.MapPost("/api/signin", async (HttpContext httpContext, HttpRequest request, IAmazonCognitoIdentityProvider cognitoClient, Auth auth) =>
            await auth.AuthUniversal(request, cognitoClient, "SignIn", httpContext));
            
        app.MapGet("/api/refresh-token", async (HttpContext httpContext, IAmazonCognitoIdentityProvider cognitoClient, Auth auth) =>
            await auth.RefreshToken(httpContext, cognitoClient));

    }
}
