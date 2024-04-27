using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace DataAccess.Models
{
    public class Card
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string BoardId { get; set; }
        public DateTime Date { get; set; }

        public required string Description { get; set; }
    }
}
