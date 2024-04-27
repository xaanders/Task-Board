using DataAccess.DBAccess;
using Newtonsoft.Json;

namespace TaskBoardAPI;

public class Utils(Environment environment)
{
    private readonly Environment _env = environment;

    public readonly IMySqlDataAccess DB = new MySqlDataAccess(environment.settings);

    public Dictionary<string, object?> parameters = [];

    internal async Task ReadParams(HttpRequest request)
    {
        parameters.Clear();
        request.Query?.ToList()?.ForEach(x =>
        {
            Console.WriteLine($"{x.Key}, {x.Value}");
            parameters[x.Key] = x.Value;
        });


        if (request.Method != "POST")
            return;

        using var reader = new StreamReader(request.Body);
        var content = await reader.ReadToEndAsync();
        var json = JsonConvert.DeserializeObject<Dictionary<string, object?>>(content);
        json?.ToList().ForEach(x => parameters[x.Key] = x.Value);
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

}
