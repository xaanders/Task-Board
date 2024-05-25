using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TaskBoardAPI;


public class JwtBearerConfigureOptions : IConfigureNamedOptions<JwtBearerOptions>
{
    private const string ConfigurationSectionName = "JwtBearer";
    private const string AwsCredentialsSectionName = "AwsCredentials";
    private readonly IConfiguration _configuration;
    public JwtBearerConfigureOptions(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public void Configure(JwtBearerOptions options)
    {
        var jwtBearerSection = _configuration.GetSection(ConfigurationSectionName);

        var awsCredentials = _configuration.GetSection(AwsCredentialsSectionName);

        if (!jwtBearerSection.Exists())
        {
            Console.WriteLine($"Configuration section '{ConfigurationSectionName}' is missing or empty.");
            return;
        }
        else if (!awsCredentials.Exists())
        {
            Console.WriteLine($"Configuration section '{AwsCredentialsSectionName}' is missing or empty.");
            return;
        }

        var jwtBearerOptions = jwtBearerSection.Get<JwtBearerOptions>();
        var awsOptions = awsCredentials.Get<AWS>();

        if (jwtBearerOptions != null && awsOptions != null)
        {
            options.Authority = $"https://cognito-idp.{awsOptions.Region}.amazonaws.com/{awsOptions.UserPoolId}";
            options.MetadataAddress = $"https://cognito-idp.{awsOptions.Region}.amazonaws.com/{awsOptions.UserPoolId}/.well-known/openid-configuration";
            options.IncludeErrorDetails = jwtBearerOptions.IncludeErrorDetails;
            options.RequireHttpsMetadata = jwtBearerOptions.RequireHttpsMetadata;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = jwtBearerOptions.TokenValidationParameters.ValidateIssuer,
                ValidIssuer = $"https://cognito-idp.{awsOptions.Region}.amazonaws.com/{awsOptions.UserPoolId}",
                ValidateAudience = jwtBearerOptions.TokenValidationParameters.ValidateAudience,
                ValidateLifetime = jwtBearerOptions.TokenValidationParameters.ValidateLifetime,
                ValidateIssuerSigningKey = jwtBearerOptions.TokenValidationParameters.ValidateIssuerSigningKey
            };
        }
    }

    public void Configure(string? name, JwtBearerOptions options)
    {
        Configure(options);
    }
}