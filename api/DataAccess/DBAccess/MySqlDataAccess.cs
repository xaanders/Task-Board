using Dapper;
using MySqlConnector;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;

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

    public async Task<List<Dictionary<string, object?>>> ExecuteQuery(string query, Dictionary<string, object?> parameters)
    {
        using IDbConnection connection = new MySqlConnection(_connection);

        Console.WriteLine($"QUERY: {query}");
        if (query.Contains("INSERT") || query.Contains("UPDATE"))
        {
            if (parameters.Count == 0)
                throw new Exception("No values passed.");

            var dynamicParameters = new DynamicParameters();

            foreach (var kvp in parameters)
            {
                dynamicParameters.Add(kvp.Key, kvp.Value);
            }

            var res = await connection.QueryAsync(query, dynamicParameters);

            return ConvertToList(res);
        }
        else
        {
            var res = await connection.QueryAsync(query, parameters);

            return ConvertToList(res);
        }
    }

    public async Task<List<Dictionary<string, object?>>> GetTemplate(string query, Dictionary<string, object?> parameters, bool returnInsertId = true)
    {

        List<string?> ignore = ["t", "where"];

        if (!query.Contains(":user_id"))
            ignore.Add("user_id");

        Dictionary<string, object?> sqlParams =
            parameters.Where(p => !ignore.Contains(p.Key))
            .ToDictionary(x => x.Key, x => x.Value);

        bool isInsert = query.Contains("{{insert_params}}");

        string returnInsertedIds = returnInsertId ? " SELECT LAST_INSERT_ID() as lastInsertId" : "";

        if (isInsert)
            query = query.Replace("{{insert_params}}",
                $"({string.Join(", ", sqlParams.Keys)}) values " +
                $"({string.Join(", ", sqlParams.Keys.Select(key => $"@{key}"))});"
                + returnInsertedIds);

        bool isUpdate = query.Contains("{{update_params}}");
        if (isUpdate)
        {
            var kvp = parameters["where"] ?? throw new Exception("No where clause");

            var where = (Dictionary<string, object?>)kvp;

            query = query.Replace("{{update_params}}",
                $"set {string.Join(",", sqlParams.Keys.Select(key => $"{key} = @{key}"))}" +
                $" WHERE {where.Keys.First()} = {where.GetValueOrDefault(where.Keys.First())}");
        }

        query = query.Replace(":", "@");

        var res = await ExecuteQuery(query, sqlParams);

        return res;
    }

    public async Task<dynamic> InsertMany(string? table, Dictionary<string, object?> parameters, bool returnInsertId = true)
    {
        if (table == null)
            throw new Exception("no table");

        if (!parameters.TryGetValue("insertArray", out object? insertArray))
            throw new Exception("no insertArray");

        if (!parameters.TryGetValue("insertStatic", out object? insertStatic))
            throw new Exception("no insertStatic");


        var results = new List<string?>();

        foreach (Dictionary<string, object?> insertData in (List<Dictionary<string, object?>>?)insertArray ?? [])
        {
            foreach (var item in (Dictionary<string, object?>?)insertStatic ?? [])
                insertData[item.Key] = item.Value;

            var columns = string.Join(",", insertData.Keys);
            var values = string.Join(",", insertData.Keys.Select(x => $"@{x}"));

            string returnInsertedIds = returnInsertId ? "SELECT LAST_INSERT_ID() as lastInsertId" : "";

            var q = $"INSERT {table}  ({columns}) values ({values}); {returnInsertedIds}";

            var res = await ExecuteQuery(q, insertData);

            if (returnInsertId)
                results.Add(res[0]["lastInserId"] as string);
        }
        return results;
    }
    public async Task<dynamic> UpdateMany(string? table, Dictionary<string, object?> parameters)
    {
        if (table == null)
            throw new Exception("no table");

        if (!parameters.TryGetValue("updateArray", out object? updateArray))
            throw new Exception("no updateArray");

        var data = new List<object?>();
        var errors = new List<Dictionary<string, object?>>();

        foreach (Dictionary<string, object?> updateData in (List<Dictionary<string, object?>>?)updateArray ?? [])
        {

            var where = (Dictionary<string, object>?)updateData["where"];

            if (where is null)
            {
                errors.Add(updateData);
                continue;
            }

            updateData.Remove("where");

            string upd = string.Join(", ", updateData.Select(x => $"{x.Key} = @{x.Key}"));

            foreach (var kvp in where)
            {
                updateData[$"where_{kvp.Key}"] = kvp.Value;
            };

            string updWhere = string.Join(" and ", where.Select(x => $"{x.Key} = @where_{x.Key}"));

            string q = "UPDATE " + table + $" SET {upd} where {updWhere}";

            await ExecuteQuery(q, updateData);

        }


        return new { data, errors };
    }

    private List<Dictionary<string, object?>> ConvertToList(IEnumerable<dynamic> res)
    {
        var resultList = new List<Dictionary<string, object?>>();

        foreach (var row in res)
        {
            var dictionary = new Dictionary<string, object?>();

            foreach (var property in row)
            {
                dictionary[property.Key] = property.Value;
            }

            resultList.Add(dictionary);
        }

        return resultList;
    }

}


