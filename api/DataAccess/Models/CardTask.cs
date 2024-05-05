using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Models;

public class CardTask(int taskId, string? title, int status, string? text, int card_id, bool isCompleted = false)
{
    public int Task_id { get; set; } = taskId;
    public string? Title { get; set; } = title;
    public int Status { get; set; } = status;
    public string? Text { get; set; } = text;
    public int Card_id { get; set; } = card_id;

    public bool Completed { get; set; } = isCompleted;
}
