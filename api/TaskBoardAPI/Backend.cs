using DataAccess.Models;

namespace TaskBoardAPI;

public class Backend(Environment environment)
{
    private readonly Environment _env = environment;
    private readonly Utils _u = new(environment);
    public async Task<object?> Universal(HttpRequest request, string? method = null)
    {

        try
        {
            await _u.ReadParams(request);

            if (!_u.parameters.TryGetValue("t", out object? t))
                throw new Exception("No query found");

            string? template = _u.GetParamStr("t");

            if (template == null || !_env.templates.ContainsKey(template.ToString()))
                throw new Exception("No template found");

            if (template != null || _u.parameters.TryGetValue("insertArray", out object? arr))
            {
                Console.WriteLine("template:{0}", template);

                var res = await _u.DB.GetTemplate(_env.templates[template!.ToString()], _u.parameters);

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

    public async Task<dynamic> GetAll(HttpRequest request)
    {
        await _u.ReadParams(request);

        string? categoryTemplate = _env.templates["select_board"];
        string? cardTemplate = _env.templates["select_card"];
        string? tasksTemplate = _env.templates["select_task"];
        string? labelsTemplate = _env.templates["select_label"];

        try
        {
            var categoryData = await _u.DB.GetTemplate(categoryTemplate, _u.parameters) as IEnumerable<dynamic?>
                ?? throw new Exception("Couldn't get data"); // get categories

            var cardsData = await _u.DB.GetTemplate(cardTemplate, _u.parameters) as IEnumerable<dynamic?>; // get cards
            var tasksData = await _u.DB.GetTemplate(tasksTemplate, _u.parameters) as IEnumerable<dynamic?>; // get tasks
            var labelsData = await _u.DB.GetTemplate(labelsTemplate, _u.parameters) as IEnumerable<dynamic?>; // get labels

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
                    var t = new CardTask(item.task_id, item.title, item.status, item.text, item.card_id, item.completed);
                    tasks.Add(t);
                }
            }
            foreach (dynamic? item in labelsData) // add labels to appropriate tasks 
            {
                if (item is not null)
                {
                    var l = new Label(item.label_id, item.color, item.text, item.card_id);
                    labels.Add(l);
                }
            }

            if (cardsData is null)
                return categories;

            foreach (dynamic? item in cardsData) // add tasks to cards and each card to card list
            {
                if (item is not null)
                {
                    var c = new Card(item.card_id, item.title, item.category_id, item.date, item.description, new List<CardTask?>(), new List<Label?>());

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
                    var c = new Category(item.category_id, item.title, new List<Card?>());

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
}
