﻿using Dapper;
using MySqlConnector;
using System.Collections.Generic;
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

    public async Task<IEnumerable<dynamic>> ExecuteQuery(string query, Dictionary<string, object?> parameters)
    {
        using IDbConnection connection = new MySqlConnection(_connection);

        if (query.Contains("INSERT") || query.Contains("UPDATE"))
        {
            if (parameters.Count == 0)
                throw new Exception("No values passed.");

            var dynamicParameters = new DynamicParameters();

            foreach (var kvp in parameters)
            {
                dynamicParameters.Add(kvp.Key, kvp.Value);
            }

            await connection.ExecuteAsync(query, dynamicParameters);

            return [];
        }
        else
        {
            return await connection.QueryAsync(query);
        }
    }

    public async Task<dynamic> GetTemplate(string query, Dictionary<string, object?> parameters)
    {

        List<string?> ignore = ["t", "where"];

        Dictionary<string, object?> sqlParams =
            parameters.Where(p => !ignore.Contains(p.Key))
            .ToDictionary(x => x.Key, x => x.Value);

        bool isInsert = query.Contains("{{insert_params}}");

        if (isInsert)
            query = query.Replace("{{insert_params}}",
                $"({string.Join(", ", sqlParams.Keys)}) values " +
                $"({string.Join(", ", sqlParams.Keys.Select(key => $"@{key}"))})");

        bool isUpdate = query.Contains("{{update_params}}");
        if (isUpdate)
        {
            var kvp = parameters["where"] ?? throw new Exception("No where clause");

            var where = (Dictionary<string, object?>)kvp;

            query = query.Replace("{{update_params}}",
                $"set {string.Join(",", sqlParams.Keys.Select(key => $"{key} = @{key}"))}" +
                $" WHERE {where.Keys.First()} = {where.GetValueOrDefault(where.Keys.First())}");
        }


        Console.WriteLine("QUERY: {0}", query);

        var res = await ExecuteQuery(query, sqlParams);

        return res;
    }

    public async Task<dynamic> InsertMany(string? table, Dictionary<string, object?> parameters)
    {
        if (table == null)
            throw new Exception("no table");

        if (!parameters.TryGetValue("insertArray", out object? insertArray))
            throw new Exception("no insertArray");

        if (!parameters.TryGetValue("insertStatic", out object? insertStatic))
            throw new Exception("no insertStatic");


        var results = new List<Dictionary<string, object?>>();

        foreach (Dictionary<string, object?> insertData in (List<Dictionary<string, object?>>?)insertArray ?? [])
        {
            foreach (var item in (Dictionary<string, object?>?)insertStatic ?? [])
                insertData[item.Key] = item.Value;

            var columns = string.Join(",", insertData.Keys);
            var values = string.Join(",", insertData.Keys.Select(x => $"@{x}"));

            var q = "INSERT " + table + " (" + columns + ") values (" + values + ")";

            var res = await ExecuteQuery(q, insertData);

            Console.WriteLine(res);
           
        }
        return results;
    }
    public async Task<dynamic> UpdateMany(string? table, Dictionary<string, object?> parameters)
    {
        if (table == null)
            throw new Exception("no table");

        if (!parameters.TryGetValue("updateArray", out object? updateArray))
            throw new Exception("no updateArray");

        var data = new List<Dictionary<string, object?>>();
        var errors = new List<Dictionary<string, object?>>();

        foreach (Dictionary<string, object?> updateData in (List<Dictionary<string, object?>>?) updateArray ?? [])
        {

            var where = (Dictionary<string, object>?) updateData["where"];

            if(where is null)
            {
                errors.Add(updateData);
                continue;
            }

            updateData.Remove("where");

            string upd = string.Join(",", updateData.Select(x => $"{x.Key} = @{x.Key}"));
            
            foreach(var kvp in where)
            {
                updateData[$"where_{kvp.Key}"] = kvp.Value;
            };

            string updWhere = string.Join(",", where.Select(x => $"{x.Key} = @where_{x.Key}"));

            string q = "UPDATE " + table + $" SET {upd} where {updWhere}";

            Console.WriteLine("q---- {0}", q);

            var res = await ExecuteQuery(q, updateData);
        }
        


        return new { data, errors};
    }

}


