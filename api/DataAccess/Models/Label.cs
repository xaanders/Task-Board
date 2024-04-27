using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Models;

public class Label
{
    public int Id { get; set; }
    public required string Color { get; set; }
    public required string Text { get; set; }

}
