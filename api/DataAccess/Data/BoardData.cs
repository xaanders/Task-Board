using DataAccess.DBAccess;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Data;

public class BoardData(IMySqlDataAccess db)
{
    private readonly IMySqlDataAccess _db = db;


}
