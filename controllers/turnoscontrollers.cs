using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using FilaceroAPI.Models;

namespace FilaceroAPI.Controllers
{
    [Route("api/turnos")]
    [ApiController]
    public class TurnosController : ControllerBase
    {
        private readonly IMongoCollection<Turno> _turnosCollection;

        public TurnosController(IConfiguration configuration)
        {
            // Intenta leer la cadena desde appsettings.json o usa la de respaldo a Atlas
            string connectionString = configuration.GetConnectionString("MongoConnection") 
                                      ?? "mongodb+srv://guerrero:nSnUAKDib7X3S4Cu@octavioguerrero.ox7wdea.mongodb.net/?retryWrites=true&w=majority";

            var client = new MongoClient(connectionString);
            
            // Nombres ajustados exactamente a tu clúster de MongoDB Atlas
            var database = client.GetDatabase("FilaCero");
            _turnosCollection = database.GetCollection<Turno>("Turnos");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Turno>>> Get()
        {
            try
            {
                var turnos = await _turnosCollection.Find(_ => true).ToListAsync();
                return Ok(turnos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno al conectar con MongoDB: {ex.Message}");
            }
       
       
       
        }
   
          [HttpPost]
public async Task<ActionResult<Turno>> Post([FromBody] Turno nuevoTurno)
{
    try
    {
        if (string.IsNullOrEmpty(nuevoTurno.NumeroTurno))
        {
            nuevoTurno.NumeroTurno = "T-" + new Random().Next(100, 999);
        }

        nuevoTurno.Estado = "En Espera";
        nuevoTurno.FechaCreacion = DateTime.UtcNow.ToString("o");

        await _turnosCollection.InsertOneAsync(nuevoTurno);
        return StatusCode(201, nuevoTurno);
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error interno al guardar en MongoDB: {ex.Message}");
    }
}
   
   
   
   
   
   
    }
}