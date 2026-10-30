using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// 1. Habilitar servicios de controladores
builder.Services.AddControllers();

// 2. Registrar los servicios de Swagger / OpenAPI (Obligatorio para evitar el error anterior)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. Habilitar CORS para que la PWA pueda hacer peticiones sin restricciones
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// 4. Activar el middleware de Swagger en la aplicación
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FilaCero API v1");
    // Opcional: esto hace que Swagger se abra directamente al entrar a http://localhost:5079/
    c.RoutePrefix = string.Empty; 
});

app.UseRouting();

// 5. Aplicar la política de CORS
app.UseCors("AllowAll");

app.UseAuthorization();

// 6. Mapear las rutas de los controladores
app.MapControllers();

app.Run();