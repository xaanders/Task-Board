using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace DataAccess.Models;

public class Card(int cardId, string? title, int? categoryId, DateTime? date, string? descr, List<CardTask?> tasks, List<Label?> labels)
{
    public int Card_id { get; set; } = cardId;
    public string? Title { get; set; } = title;
    public int? Category_id { get; set; } = categoryId;
    public DateTime? Date { get; set; } = date;
    public string? Description { get; set; } = descr;
    public List<CardTask?> Tasks { get; set; } = tasks;
    public List<Label?> Labels { get; set; } = labels;

}
