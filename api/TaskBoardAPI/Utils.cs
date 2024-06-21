using DataAccess.DBAccess;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;


namespace TaskBoardAPI;

public class Utils(Environment environment)
{
    private readonly Environment _env = environment;

    public readonly IMySqlDataAccess DB = new MySqlDataAccess(environment.settings);

    public Dictionary<string, object?> parameters = [];

    internal async Task ReadParams(HttpRequest request)
    {
        parameters.Clear();
        request.Query?.ToList()?.ForEach(x => parameters[x.Key] = x.Value);


        if (request.Headers.TryGetValue("Authorization", out var AuthToken))
        {
            var handler = new JwtSecurityTokenHandler();
            var token = AuthToken.ToString().Substring(7);
            var requestJwtToken = handler.ReadJwtToken(token);
            parameters["user_id"] = requestJwtToken.Claims.First(claim => claim.Type == "sub").Value;
        }


        if (request.Method == "GET")
            return;

        if (request.HasFormContentType)
        {
            var form = await request.ReadFormAsync();
            form.ToList().ForEach(x => parameters[x.Key] = x.Value);
        }
        else
        {
            using var reader = new StreamReader(request.Body);
            var content = await reader.ReadToEndAsync();
            var json = JsonConvert.DeserializeObject<Dictionary<string, object?>>(content);
            json?.ToList().ForEach(x => parameters[x.Key] = x.Value);
        }

        foreach(var kvp in parameters)
        {
            Console.WriteLine($"{kvp.Key} {kvp.Value?.GetType()}");
        }

        if (!parameters.ContainsKey("where"))
            return;

        foreach (var item in parameters.Where(p => p.Key == "where"))
        {
            var key = item.Value?.ToString();
            if (key != null)
            {
                var jsonWhere = JsonConvert.DeserializeObject<Dictionary<string, object?>>(key);
                parameters["where"] = jsonWhere;
            }
        }

    }
    internal object? GetParamObj(string name, bool required = false)
    {
        var exist = parameters.TryGetValue(name, out object? value);
        if (!exist && required)
            throw new Exception(name + " Not Found");

        return value;
    }

    internal string? GetParamStr(string name, bool required = false)
    {
        return GetParamObj(name, required)?.ToString();
    }
    internal string CalculateSecretHash(string username, string? clientId, string? clientSecret)
    {
        if (clientId is null || clientSecret is null)
            return "";

        var message = Encoding.UTF8.GetBytes(username + clientId);
        var key = Encoding.UTF8.GetBytes(clientSecret);

        using (var hmac = new HMACSHA256(key))
        {
            var hash = hmac.ComputeHash(message);
            return Convert.ToBase64String(hash);
        }
    }

}
