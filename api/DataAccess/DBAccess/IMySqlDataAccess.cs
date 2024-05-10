﻿
namespace DataAccess.DBAccess
{
    public interface IMySqlDataAccess
    {
        Task<IEnumerable<dynamic>> ExecuteQuery(string query, Dictionary<string, object?> parameters);
        Task<dynamic> GetTemplate(string query, Dictionary<string, object?> parameters);
        Task<dynamic> InsertMany(string? table, Dictionary<string, object?> parameters);
        Task<dynamic> UpdateMany(string? table, Dictionary<string, object?> parameters);
    }
}