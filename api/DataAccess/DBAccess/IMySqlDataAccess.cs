
namespace DataAccess.DBAccess
{
    public interface IMySqlDataAccess
    {
        Task<IEnumerable<object?>> ExecuteQuery(string query);
        Task<object?> GetTemplate(string query, Dictionary<string, object?> parameters);
    }
}