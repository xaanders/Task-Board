
namespace DataAccess.DBAccess
{
    public interface IMySqlDataAccess
    {
        Task<List<Dictionary<string, object?>>> ExecuteQuery(string query, Dictionary<string, object?> parameters);
        Task<List<Dictionary<string, object?>>> GetTemplate(string query, Dictionary<string, object?> parameters, bool returnInsertId = true);
        Task<dynamic> InsertMany(string? table, Dictionary<string, object?> parameters, bool returnInsertId = true);
        Task<dynamic> UpdateMany(string? table, Dictionary<string, object?> parameters);
    }
}