using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Models;

public class Category(int? id, string? title, List<Card?> cards)
{
    public int? Category_id { get; set; } = id;
    public string? Title { get; set; } = title;
    public List<Card?> Cards { get; set; } = cards;
}
