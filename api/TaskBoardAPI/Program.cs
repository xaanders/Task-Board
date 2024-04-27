using TaskBoardAPI;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var environment = new TaskBoardAPI.Environment();
await environment.ReadTemplates();
await environment.ReadSettings();

builder.Services.AddTransient(_ => new Backend(environment));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", builder =>
    {
        builder.WithOrigins("http://localhost:7164/")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

var app = builder.Build();


app.UseCors("AllowSpecificOrigin"); ;

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.ConfigureApi();

app.Run();

