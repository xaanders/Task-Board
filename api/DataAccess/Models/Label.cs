using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Models;

public class Label(int id, string? color, string? text, int cardId)
{
    public int Label_Id { get; set; } = id;
    public string? Color { get; set; } = color;
    public string? Text { get; set; } = text;
    public int Card_id { get; set; } = cardId;
}
