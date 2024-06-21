using Amazon;
using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using Amazon.Runtime;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using TaskBoardAPI;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAuthorization();

// Configure JWT Bearer authentication

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

builder.Services.ConfigureOptions<JwtBearerConfigureOptions>();

var environment = new TaskBoardAPI.Environment();

await environment.ReadTemplates();
await environment.ReadSettings();

builder.Services.AddSingleton<EmailService>();

builder.Services.AddTransient(sp => new Backend(environment, sp.GetRequiredService<EmailService>()));

builder.Services.AddTransient(sp => new Auth(
    sp.GetRequiredService<IConfiguration>(),
    environment
));


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});

builder.Services.AddSingleton<IAmazonCognitoIdentityProvider, AmazonCognitoIdentityProviderClient>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    return new AmazonCognitoIdentityProviderClient(new AnonymousAWSCredentials(), RegionEndpoint.GetBySystemName(config["AwsCredentials:Region"]));
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseCors("AllowSpecificOrigin");

// Add authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// Configure API endpoints
app.ConfigureApi();

app.Run();