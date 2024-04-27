namespace TaskBoardAPI
{
    public static class API
    {
        public static void ConfigureApi(this WebApplication app) 
        {
            app.Use(async (context, next) =>
            {
                // ...
                Console.WriteLine($"Request: {context.Request.Path}{context.Request.QueryString}");
                //
                await next(context);
            });

            app.MapGet("/api/board", async (HttpRequest request,string t, Backend backend) => await backend.Universal(request, t));

        }
    }
}
