using Amazon.SimpleEmail.Model;
using DataAccess.Models;
using Newtonsoft.Json.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Net;

namespace TaskBoardAPI;

public class Backend(Environment environment, EmailService emailService)
{
    private readonly Environment _env = environment;
    private readonly EmailService _emailService = emailService;
    private readonly Utils _u = new(environment);
    public async Task<object?> Universal(HttpRequest request, string? method = null)
    {

        try
        {
            await _u.ReadParams(request);

            if (_u.parameters.TryGetValue("inviteUser", out object? isInviteUser))
                return await InviteUser(request);

            bool returnInsertedId = bool.Parse(_u.GetParamStr("returnInsertedId") ?? "true");

            if (returnInsertedId)
                _u.parameters.Remove("returnInsertedId");

            if (_u.parameters.TryGetValue("insertArray", out object? insertArray) && _u.parameters.TryGetValue("insertStatic", out object? insertStatic))
            {
                string? table = _u.GetParamStr("table") ?? throw new Exception("No table found");

                var list = insertArray as JArray;
                var stat = insertStatic as JObject;

                _u.parameters["insertArray"] = list?.ToObject<List<Dictionary<string, object?>>>();
                _u.parameters["insertStatic"] = stat?.ToObject<Dictionary<string, object?>>();


                var res = await _u.DB.InsertMany(table, _u.parameters, returnInsertedId);

                return res;
            } // insert bulk

            if (_u.parameters.TryGetValue("updateArray", out object? updateArray))
            {
                string? table = _u.GetParamStr("table") ?? throw new Exception("No table found");

                var list = updateArray as JArray;

                var arr = list?.ToObject<List<Dictionary<string, object?>>>();

                foreach (var item in arr ?? [])
                {
                    var jWhere = item["where"] as JObject;
                    item["where"] = jWhere?.ToObject<Dictionary<string, object?>>();
                }

                _u.parameters["updateArray"] = arr;

                var res = await _u.DB.UpdateMany(table, _u.parameters);

                return res;

            } // update bulk

            if (!_u.parameters.TryGetValue("t", out object? t)) // get template
                throw new Exception("No query found");

            string? template = _u.GetParamStr("t");

            if (template == null || !_env.templates.ContainsKey(template.ToString()))
                throw new Exception("No template found");

            if (template != null)
            {
                var envTemplate = _env.templates[template!.ToString()];

                if (request.Headers.TryGetValue("Authorization", out var AuthToken) && envTemplate.Contains("user_id = :user_id"))
                {
                    var handler = new JwtSecurityTokenHandler();
                    var token = AuthToken.ToString().Substring(7);
                    var requestJwtToken = handler.ReadJwtToken(token);
                    _u.parameters["user_id"] = requestJwtToken.Claims.First(claim => claim.Type == "sub").Value;
                }

                var res = await _u.DB.GetTemplate(envTemplate, _u.parameters, returnInsertedId);

                return res;
            }

            throw new Exception("Unknown method");
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: {0}", ex.Message);
            return new Dictionary<string, object>
            {
                { "Error", ex.Message },
            };
        }
    }

    public async Task<dynamic> GetCategories(HttpRequest request)
    {
        await _u.ReadParams(request);

        try
        {
            var categoryData = await _u.DB.GetTemplate(_env.templates["select_category"], _u.parameters)
                ?? throw new Exception("Couldn't get data"); // get categories

            var cardsData = await _u.DB.GetTemplate(_env.templates["select_card"], _u.parameters); // get cards
            var tasksData = await _u.DB.GetTemplate(_env.templates["select_task"], _u.parameters); // get tasks
            var labelsData = await _u.DB.GetTemplate(_env.templates["select_label"], _u.parameters); // get labels

            var categories = new List<Category>();
            var cards = new List<Card>();
            var tasks = new List<CardTask>();
            var labels = new List<Label>();

            if (tasksData is null || labelsData is null)
                return categories;

            foreach (dynamic? item in tasksData) // create tasks list
            {
                if (item is not null)
                {
                    var t = new CardTask((int)item["task_id"], item["title"], item["status"], item["text"], item["card_id"], item["completed"]);
                    tasks.Add(t);
                }
            }
            foreach (dynamic? item in labelsData) // add labels to appropriate tasks 
            {
                if (item is not null)
                {
                    var l = new Label(item["label_id"], item["color"], item["text"], item["card_id"]);
                    labels.Add(l);
                }
            }

            if (cardsData is null)
                return categories;

            foreach (dynamic? item in cardsData) // add tasks to cards and each card to card list
            {
                if (item is not null)
                {
                    var c = new Card(item["card_id"], item["title"], item["category_id"], item["date"], item["description"], new List<CardTask?>(), new List<Label?>());

                    tasks.ForEach(x =>
                    {
                        if (x.Card_id == c.Card_id)
                            c.Tasks.Add(x);
                    });
                    labels.ForEach(x =>
                    {
                        if (x.Card_id == c.Card_id)
                            c.Labels.Add(x);
                    });

                    cards.Add(c);
                }
            }

            foreach (dynamic? item in categoryData) //
            {
                if (item is not null)
                {
                    var c = new Category(item["category_id"], item["title"], item["board_id"], new List<Card?>());

                    cards.ForEach(x =>
                    {
                        if (x.Category_id == c.Category_id)
                            c.Cards.Add(x);
                    });

                    categories.Add(c);
                }
            }

            return categories;
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: {0}", ex.Message);
            return new Dictionary<string, object>
            {
                { "Error", ex.Message },
            };
        }
    }

    public async Task<dynamic?> InviteUser(HttpRequest request)
    {
        try
        {
            if (!_u.parameters.TryGetValue("sendEmail", out object? email))
                throw new Exception("No email provided");

            var sendEmail = email?.ToString() ?? throw new Exception("The email is invalid");

            if (!_u.parameters.TryGetValue("sendName", out object? name))
                throw new Exception($"No name provided for user with email {sendEmail}");

            var sendName = name?.ToString() ?? throw new Exception("The name is invalid");

            if (!_u.parameters.TryGetValue("projectId", out object? projectId))
                throw new Exception($"No project id provided");

            if (!_u.parameters.TryGetValue("projectName", out object? projectName))
                throw new Exception($"No project name provided");

            var sqlUser = new Dictionary<string, object?> {
                    { "sendEmail", sendEmail }
                };

            var dbUser = await _u.DB.ExecuteQuery(
                "select user_id, id, name from user where email = @sendEmail",
                sqlUser); // find out if user exists

            var isSend = false;
            var result = new Dictionary<string, object?>();

            if (dbUser != null && dbUser.Count() > 0) // if exists
            {
                result.Add("dbUser", dbUser);

                var dbUserDict = dbUser.FirstOrDefault();

                string? newName = dbUserDict?["name"] as string;
                if (newName != null)
                    sendName = newName;

                var sqlParams = new Dictionary<string, object?>
                {
                    {"project_id", projectId },
                    {"user_id", dbUser[0]["user_id"] },
                };

                var insertUserProject = await _u.DB.ExecuteQuery(
                    "insert user_project (user_id, project_id) values (@user_id, @project_id)", sqlParams);  // add user to the project

                result.Add("insert user project", insertUserProject); // debug

                isSend = await _emailService.SendEmailAsync(
                    sendEmail,
                    "Project Invitation",
                    $"Hello, {sendName}! You were invited to Task Board project!",
                    $"http://localhost:3000/dashboard?project_id={projectId}"
                ); // send invitation
            }
            else
            {
                Console.WriteLine("creating new user");
                var sqlParams = new Dictionary<string, object?> // create user 
                {
                    {"email", sendEmail },
                    {"status", 0 },
                    {"is_email_confirmed", 0 },
                };

                var insertUser = await _u.DB.ExecuteQuery(
                    "insert user (email, status, is_email_confirmed) values (@email, @status, @is_email_confirmed); SELECT LAST_INSERT_ID() as lastInsertId", sqlParams);

                var dict = insertUser.FirstOrDefault();

                string? userId = dict?["user_id"] as string;

                if (!string.IsNullOrEmpty(userId))
                {
                    // Extract the lastInsertId from the first item in the list
                    Console.WriteLine("userid {0}", userId);
                    var userProjectParams = new Dictionary<string, object?>
                    {
                        {"project_id", projectId },
                        {"user_id",  userId},
                    };

                    var insertUserProject = await _u.DB.ExecuteQuery(
                        "insert user_project (user_id, project_id) values (@user_id, @project_id)",
                        userProjectParams);  // add user to the project


                    isSend = await _emailService.SendEmailAsync(
                        sendEmail,
                        "Project Invitation",
                        $"Hello, {sendName}! <br/> You were invited to Task Board project! <br/> Please signup to see its boards!",
                        $"http://localhost:3000/sign-up?email={sendEmail}&name={sendName}"
                    );
                }
            }

            if (isSend)
            {
                return new { Success = true, Message = "Email sent successfully.", Result = result };
            }
            else
            {
                return new { Message = "Failed to send email.", Result = result };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: {0}", ex.Message);
            return new Dictionary<string, object>
            {
                { "Error", ex.Message },
            };
        }
    }
    public class InsertResult
    {
        public int lastInsertId { get; set; }
    }
}
