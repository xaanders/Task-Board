using Amazon.CognitoIdentityProvider.Model;
using Amazon.CognitoIdentityProvider;
using Amazon.Runtime.Internal;
namespace TaskBoardAPI;
using DataAccess.Models;
using Newtonsoft.Json.Linq;
using System.IdentityModel.Tokens.Jwt;

public class Auth(IConfiguration configuration, Environment environment)
{
    private readonly Utils _u = new(environment);
    private readonly IConfiguration _config = configuration;

    public async Task<dynamic> AuthUniversal(HttpRequest request, IAmazonCognitoIdentityProvider cognitoClient, string authType)
    {
        await _u.ReadParams(request);

        string? name = _u.GetParamStr("name");
        string? email = _u.GetParamStr("email");
        string? password = _u.GetParamStr("password");

        if (email is null) return Results.BadRequest(new { Message = "No email provided." });
      
        var user = new User(name, email, password);

        if (!user.IsEmailValid)
            return Results.BadRequest(new { Message = "The email is invalid." });

        if (authType == "ConfirmEmail")
            return await ConfirmEmail(cognitoClient, email);
        else if (authType == "ResendCode")
            return await ResendConfirmationCode(cognitoClient, email);

        if (user.Password is null)
            return Results.BadRequest(new { Message = "No password provided." });

        if (authType == "SignUp")
        {
            if (user.Name is null)
                return Results.BadRequest(new { Message = "No user name information provided." });
                
            return await InitiateSignUp(cognitoClient, user);
        }
        else
            return await SignIn(cognitoClient, user);



    }
    public async Task<dynamic> InitiateSignUp(IAmazonCognitoIdentityProvider cognitoClient, User user)
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
    public async Task<dynamic> SignIn(IAmazonCognitoIdentityProvider cognitoClient, User user)
    {
        try
        {
            var secretHash = _u.CalculateSecretHash(user.Email, _config["AwsCredentials:ClientId"], _config["AwsCredentials:ClientSecret"]);

            var authParameters = new Dictionary<string, string>
            {
                { "USERNAME", user.Email },
                { "PASSWORD", user.Password },
                { "SECRET_HASH", secretHash }

            };

            var request = new InitiateAuthRequest
            {
                ClientId = _config["AwsCredentials:ClientId"],
                AuthParameters = authParameters,
                AuthFlow = AuthFlowType.USER_PASSWORD_AUTH,
            };

            var response = await cognitoClient.InitiateAuthAsync(request);

            return Results.Ok(new
            {
                IdToken = response.AuthenticationResult.IdToken,
                AccessToken = response.AuthenticationResult.AccessToken,
                RefreshToken = response.AuthenticationResult.RefreshToken
            });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { Message = ex.Message });
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

            return Results.Ok(new { Message = "Email confirmed successfully." });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { Message = ex.Message });
        }
    }

    public async Task<dynamic> ResendConfirmationCode(IAmazonCognitoIdentityProvider cognitoClient, string email)
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

}


// signup - send code -> confirm email

// login -> "Email is not confirmed" -> "Resend code?" -> ResendConfirmationCode -> confirm email -> sign user in