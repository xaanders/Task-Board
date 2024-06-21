using Amazon;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TaskBoardAPI;

public class EmailService
{
    private readonly IAmazonSimpleEmailService _sesClient;
    private readonly string? _sourceEmail;

    public EmailService(IConfiguration configuration)
    {
        var accessKey = configuration["AwsCredentials:AccessKey"];
        var secretKey = configuration["AwsCredentials:SecretKey"];
        var region = configuration["AwsCredentials:Region"];
        _sourceEmail = configuration["AwsCredentials:SourceEmail"];

        var awsCredentials = new Amazon.Runtime.BasicAWSCredentials(accessKey, secretKey);
        var awsRegion = RegionEndpoint.GetBySystemName(region);

        _sesClient = new AmazonSimpleEmailServiceClient(awsCredentials, awsRegion);
    }

    public async Task<bool> SendEmailAsync(string toAddress, string subject, string body, string link)
    {
        string htmlBody = $@"
        <html>
        <body>
            <p>{body}</p>
            <p><a href='{link}'>Click here</a> to view more details.</p>
        </body>
        </html>";

        var sendRequest = new SendEmailRequest
        {
            Source = _sourceEmail,
            Destination = new Destination
            {
                ToAddresses = new List<string> { toAddress }
            },
            Message = new Message
            {
                Subject = new Content(subject),
                Body = new Body
                {
                    Html = new Content(htmlBody)
                }
            }
        };
        try
        {
            var response = await _sesClient.SendEmailAsync(sendRequest);
            return response.HttpStatusCode == System.Net.HttpStatusCode.OK;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending email:");
            Console.WriteLine(ex.Message);
            return false;
        }
    }

}
