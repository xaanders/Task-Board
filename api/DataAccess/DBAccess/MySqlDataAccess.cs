using Microsoft.Extensions.Configuration;
using Dapper;
using MySqlConnector;
using System.Data;
using System.Threading.Tasks;

namespace DataAccess.DBAccess;

public class MySqlDataAccess : IMySqlDataAccess
{
    private readonly string _connection;

    public MySqlDataAccess(Dictionary<string, string> settings)
    {
        var server = settings["DB_HOST"];
        var user = settings["DB_USER"];
        var name = settings["DB_NAME"];
        var pass = settings["DB_PASSWORD"];
        _connection = $"Server={server}; User ID={user}; Password={pass}; Database={name}";
    }

    public async Task<IEnumerable<dynamic?>> ExecuteQuery(string query)
    {
        using IDbConnection connection = new MySqlConnection(_connection);

        return await connection.QueryAsync(query);
    }


    public async Task<object?> GetTemplate(string query, Dictionary<string, object?> parameters)
    {
        // TODO: template modification with parameters

        var res = await ExecuteQuery(query);

        return res;
    }
}

   
