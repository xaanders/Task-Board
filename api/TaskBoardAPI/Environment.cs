using Newtonsoft.Json;
using static Dapper.SqlMapper;

namespace TaskBoardAPI;

public class Environment
{
    public Dictionary<string, string> templates = [];
    public Dictionary<string, string> settings = [];

    internal async Task<Dictionary<string, object>> ReadTemplates()
    {
        try
		{
            templates = JsonConvert.DeserializeObject<Dictionary<string, string>>(await
               File.ReadAllTextAsync("query_templates.json")) ?? [];

        }
		catch (Exception ex)
		{
            Console.WriteLine("Error in ReadTemplates: {0}", ex.Message);
            return new Dictionary<string, object>
                {
                    { "Error", ex.Message },
                    { "sqlMessage", ex.Message },
                    { "errno", 1 }
                };
        }
        return new Dictionary<string, object> { { "Lines",  templates.Count } };
    }

    internal async Task<Dictionary<string, object>> ReadSettings()
    {
        try
        {
            settings = JsonConvert.DeserializeObject<Dictionary<string, string>>(await
               File.ReadAllTextAsync("settings_dev.json")) ?? [];

        }
        catch (Exception ex)
        {
            Console.WriteLine("Error in ReadSettings: {0}", ex.Message);
            return new Dictionary<string, object>
                {
                    { "Error", ex.Message },
                    { "sqlMessage", ex.Message },
                    { "errno", 1 }
                };
        }

        return new Dictionary<string, object> { { "Lines", settings.Count } };
    }
}
