using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskBoardAPI;

public class Backend(Environment environment)
{
    private readonly Environment _env = environment;
    private readonly Utils _u = new Utils(environment);
    public async Task<object?> Universal(HttpRequest request, string SWtemplate, string? method = null)
    {

        try
        {
            await _u.ReadParams(request);


            if (!_u.parameters.TryGetValue("t", out object? t))
                throw new Exception("No query found");

            string? template = _u.GetParamStr("t");

            if (template != null)
            {
                Console.WriteLine("template:{0}", template);
        
                var res = await _u.DB.GetTemplate(_env.templates[template!.ToString()], _u.parameters);

                return res;
            }

            throw new Exception("Unknown method");

        }
        catch (Exception ex)
		{
            Console.WriteLine("Error: {0}", ex.Message);
            return new Dictionary<string, object>
            {
                { "Error", ex.Message },
                { "sqlMessage", ex.Message },
                { "errno", 1 }
            };
        }
    }
}
