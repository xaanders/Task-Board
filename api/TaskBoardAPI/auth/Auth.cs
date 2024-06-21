using Amazon.CognitoIdentityProvider.Model;
using Amazon.CognitoIdentityProvider;
namespace TaskBoardAPI;
using DataAccess.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Net;

public class Auth(IConfiguration configuration, Environment environment)
{
    private readonly Utils _u = new(environment);
    private readonly Environment _env = environment;

    private readonly IConfiguration _config = configuration;

    public async Task<dynamic> AuthUniversal(HttpRequest request, IAmazonCognitoIdentityProvider cognitoClient, string authType, HttpContext httpContext)
    {
        await _u.ReadParams(request);

        string? name = _u.GetParamStr("name");
        string? email = _u.GetParamStr("email");
        string? password = _u.GetParamStr("password");

        if (email is null) return Results.BadRequest(new { Error = "No email provided." });

        var user = new AuthUser(name, email, password);

        if (!user.IsEmailValid)
            return Results.BadRequest(new { Error = "The email is invalid." });

        if (authType == "ConfirmEmail")                                                                 //confirm email
            return await ConfirmEmail(cognitoClient, user.Email);
        else if (authType == "ResendCode")                                                              //resend code confirmation
            return await ResendConfirmationCode(cognitoClient, user.Email);

        if (user.Password is null)
            return Results.BadRequest(new { Error = "No password provided." });

        if (authType == "SignUp")                                                                       //sign up
        {
            if (user.Name is null)
                return Results.BadRequest(new { Error = "No user name information provided." });

            return await InitiateSignUp(cognitoClient, user);
        }
        else if (authType == "SignIn" && user.Password != null)                                         //signin
            return await SignIn(httpContext, cognitoClient, user);


        return Results.BadRequest();
    }
    public async Task<dynamic> InitiateSignUp(IAmazonCognitoIdentityProvider cognitoClient, AuthUser user)
    {
        try
        {

            var signupRequest = new SignUpRequest
            {
                ClientId = _config["AwsCredentials:ClientId"],
                Username = user.Email,
                Password = user.Password,
                SecretHash = _u.CalculateSecretHash(user.Email, _config["AwsCredentials:ClientId"], _config["AwsCredentials:ClientSecret"])
            };

            signupRequest.UserAttributes.Add(new AttributeType
            {
                Name = "email",
                Value = user.Email
            });
            signupRequest.UserAttributes.Add(new AttributeType
            {
                Name = "name",
                Value = user.Name
            });

            var result = await cognitoClient.SignUpAsync(signupRequest);

            var upd = new Dictionary<string, object?>
            {
                {"id", result.UserSub },
                {"email", user.Email },
                {"name", user.Name },
                {"status", 1 },
            };

            var res = await _u.DB.ExecuteQuery($"insert `user` (id, name, email, status) values (@id, @name, @email, @status)", upd);

            return Results.Ok(new { Message = "User registered successfully. Please check your email to confirm your account." });
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: {0}", ex.Message);
            return new Dictionary<string, object>
            {
                { "Error", ex.Message },
            };
        }

    }
    //public async Task<dynamic> ConfirmSignUp(HttpRequest request) { }
    public async Task<dynamic> SignIn(HttpContext httpContext, IAmazonCognitoIdentityProvider cognitoClient, AuthUser user)
    {
        try
        {
            var secretHash = _u.CalculateSecretHash(user.Email, _config["AwsCredentials:ClientId"], _config["AwsCredentials:ClientSecret"]);
            Console.WriteLine("secret hash signin {0} for email {1}", secretHash, user.Email);

            var authParameters = new Dictionary<string, string>
            {
                { "USERNAME", user.Email },
                { "PASSWORD", user.Password ?? "" },
                { "SECRET_HASH", secretHash }

            };

            var request = new InitiateAuthRequest
            {
                ClientId = _config["AwsCredentials:ClientId"],
                AuthParameters = authParameters,
                AuthFlow = AuthFlowType.USER_PASSWORD_AUTH,
            };

            var response = await cognitoClient.InitiateAuthAsync(request);

            httpContext.Response.Cookies.Append("RefreshToken", response.AuthenticationResult.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(30)
            });
            httpContext.Response.Cookies.Append("IdToken", response.AuthenticationResult.IdToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(30)
            });

            var token = response.AuthenticationResult.IdToken;
            var handler = new JwtSecurityTokenHandler();
            var jwtSecurityToken = handler.ReadJwtToken(token);

            string id = jwtSecurityToken.Claims.First(claim => claim.Type == "sub").Value;

            var dbRes = await _u.DB.GetTemplate(_env.templates["select_current_user"], new Dictionary<string, object?>
            {
                {"id", id}
            });

            return Results.Ok(new { accessToken = response.AuthenticationResult.AccessToken, User = dbRes.FirstOrDefault() });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { Error = ex.Message });
        }
    }
    public async Task<dynamic> RefreshToken(HttpContext httpContext, IAmazonCognitoIdentityProvider cognitoClient)
    {

        try
        {
            if (!httpContext.Request.Cookies.TryGetValue("RefreshToken", out var refreshToken))
                return Results.Ok(new { Message = "Refresh token not found.", NoUser = true });

            if (!httpContext.Request.Cookies.TryGetValue("IdToken", out var IdToken))
                throw new Exception("Id Token not found.");

            var handler = new JwtSecurityTokenHandler();
            var requestJwtToken = handler.ReadJwtToken(IdToken);

            var sub = requestJwtToken.Claims.First(claim => claim.Type == "sub").Value;
            var clientId = _config["AwsCredentials:ClientId"];
            var clientSecret = _config["AwsCredentials:ClientSecret"];

            var secretHash = _u.CalculateSecretHash(sub, clientId, clientSecret);

            var authParameters = new Dictionary<string, string>
            {
                { "SECRET_HASH", secretHash },
                { "REFRESH_TOKEN", refreshToken }
            };

            var request = new InitiateAuthRequest
            {
                ClientId = clientId,
                AuthFlow = AuthFlowType.REFRESH_TOKEN,
                AuthParameters = authParameters
            };

            var response = await cognitoClient.InitiateAuthAsync(request);

            if (response.AuthenticationResult.RefreshToken != null)
            {
                httpContext.Response.Cookies.Append("RefreshToken", response.AuthenticationResult.RefreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(30)
                });
            }

            // Update IdToken cookie
            httpContext.Response.Cookies.Append("IdToken", response.AuthenticationResult.IdToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(30)
            });

            var token = response.AuthenticationResult.IdToken;

            var jwtSecurityToken = handler.ReadJwtToken(token);

            var dbRes = await _u.DB.GetTemplate(_env.templates["select_current_user"], new Dictionary<string, object?>
            {
                {"id", sub}
            });

            return Results.Ok(new { User = dbRes.FirstOrDefault(), response.AuthenticationResult.AccessToken });
        }
        catch (NotAuthorizedException ex)
        {
            Console.WriteLine("Error: {0}", ex.Message);
            return Results.Ok(new { Message = "Refresh token is expired or invalid. Please re-authenticate.", IsSignOut = true });
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: {0}", ex.Message);
            return Results.BadRequest(new { ex.Message });
        }
    }
    public async Task<dynamic> ConfirmEmail(IAmazonCognitoIdentityProvider cognitoClient, string email)
    {
        try
        {

            string confirmationCode = _u.GetParamStr("confirmationCode") ?? throw new Exception("No confirmation code provided."); ;

            var secretHash = _u.CalculateSecretHash(email, _config["AwsCredentials:ClientId"], _config["AwsCredentials:ClientSecret"]);

            var confirmRequest = new ConfirmSignUpRequest
            {
                ClientId = _config["AwsCredentials:ClientId"],
                Username = email,
                ConfirmationCode = confirmationCode,
                SecretHash = secretHash
            };

            var result = await cognitoClient.ConfirmSignUpAsync(confirmRequest);



            var res = await _u.DB.ExecuteQuery("update `user` set is_email_confirmed = 1 where email = @email", new Dictionary<string, object?>
            {
                {"email", email}
            });

            return Results.Ok(new { Message = "Email confirmed successfully." });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { Error = ex.Message });
        }
    }

    public async Task<dynamic> ResendConfirmationCode(IAmazonCognitoIdentityProvider cognitoClient, string email)
    {
        try
        {
            var secretHash = _u.CalculateSecretHash(email, _config["AwsCredentials:ClientId"], _config["AwsCredentials:ClientSecret"]);

            var codeRequest = new ResendConfirmationCodeRequest
            {
                ClientId = _config["AwsCredentials:ClientId"],
                Username = email,
                SecretHash = secretHash
            };

            var response = await cognitoClient.ResendConfirmationCodeAsync(codeRequest);

            Console.WriteLine($"Method of delivery is {response.CodeDeliveryDetails.DeliveryMedium}");

            return response.CodeDeliveryDetails;
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { ex.Message });
        }
    }

    public object SignOut(HttpContext httpContext)
    {
        var response = httpContext.Response;

        response.Cookies.Append("RefreshToken", "", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(-1)
        });

        response.Cookies.Append("IdToken", "", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(-1)
        });

        return Results.Ok(new { Message = "Successfully signed out." });

    }
}


