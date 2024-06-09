using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace DataAccess.Models;

public class User(string? name, string email, string id, int? status, int? is_email_confirmed)
{
    public string? Id { get; set; } = id;
    public string? Name { get; set; } = name;
    public string Email { get; set; } = email;
    public int? Status { get; set; } = status;
    public int? Is_email_confimed { get; set; } = is_email_confirmed;

}
