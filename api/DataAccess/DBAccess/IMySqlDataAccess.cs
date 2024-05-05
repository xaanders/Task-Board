
namespace DataAccess.DBAccess
{
    public interface IMySqlDataAccess
    {
        Task<IEnumerable<dynamic>> ExecuteQuery(string query, Dictionary<string, object?> parameters);
        Task<dynamic> GetTemplate(string query, Dictionary<string, object?> parameters);
    }
}