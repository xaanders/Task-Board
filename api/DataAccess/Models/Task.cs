using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Models;

public class Task
{
    public int Id { get; set; }

    public required string Title { get; set; }
    public int Status { get; set; }
    public required string Text { get; set; }

}
