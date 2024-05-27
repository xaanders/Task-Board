using Amazon.CognitoIdentityProvider.Model;
using Amazon.CognitoIdentityProvider;
namespace TaskBoardAPI;

public class Auth(IConfiguration configuration, Environment environment)
{
    private readonly Utils _u = new(environment);
    private readonly IConfiguration _config = configuration;

    public async Task<dynamic> InitiateSignUp(HttpRequest request, IAmazonCognitoIdentityProvider cognitoClient) 
    {
        await _u.ReadParams(request);
        try
        {
            string? name = _u.GetParamStr("name");
            string? email = _u.GetParamStr("email");
            string? password = _u.GetParamStr("password");

            if (name is null || password is null || email is null)
            {
                throw new Exception("No user information provided.");
            }

            var signupRequest = new SignUpRequest
            {
                ClientId = _config["AwsCredentials:ClientId"],
                Username = email,
                Password = password,
                SecretHash = _u.CalculateSecretHash(email, _config["AwsCredentials:ClientId"], _config["AwsCredentials:ClientSecret"])
            };

            signupRequest.UserAttributes.Add(new AttributeType
            {
                Name = "email",
                Value = email
            });
            signupRequest.UserAttributes.Add(new AttributeType
            {
                Name = "name",
                Value = name
            });

            var result = await cognitoClient.SignUpAsync(signupRequest);
            return Results.Ok(new { Message = "User registered successfully. Please check your email to confirm your account."});
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
    //public async Task<dynamic> SignIn(HttpRequest request) { }

}
