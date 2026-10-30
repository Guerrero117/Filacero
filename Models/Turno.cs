using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FilaceroAPI.Models
{
    public class Turno
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("numeroTurno")]
        public string NumeroTurno { get; set; } = string.Empty;

        [BsonElement("nombrePaciente")]
        public string NombrePaciente { get; set; } = string.Empty;

        [BsonElement("motivoConsulta")]
        public string MotivoConsulta { get; set; } = string.Empty;

        [BsonElement("nivelTriage")]
        public string NivelTriage { get; set; } = string.Empty;

        [BsonElement("estado")]
        public string Estado { get; set; } = string.Empty;

        [BsonElement("fechaCreacion")]
        public string FechaCreacion { get; set; } = string.Empty;
    }
}