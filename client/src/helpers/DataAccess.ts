import { toast } from "react-toastify";
import { IBoard, IDBCall } from "../types/interfaces";
import { getErrorMessage, settings } from "./helpers";

const LocalStorageKeyName = "kanban-boards";
//Data Layer
export class BoardAPI {

  async fetchBoardList(): Promise<IBoard[]> {
    const apiData = await fetch("http://localhost:5058/api/data");

    if (!apiData.ok)
      throw new Error("Couldn't get data");

    let boardList: IBoard[] = await apiData.json();

    //first check local storage if local storage is empty then add api mock data as seed

    // if (localStorage.getItem(LocalStorageKeyName)) {
    //   const localStorageData: IBoard[] = JSON.parse(
    //     localStorage.getItem(LocalStorageKeyName) ?? "",
    //   );
    //   BoardList = [...localStorageData];
    // } else {
    //   BoardList = [...apiData];
    //   updateLocalStorageBoards(BoardList);
    // }
    console.log(boardList)
    return boardList;
    //TODO:integrate API module when got API from backend team :)
    /*
      private readonly api = new Api();//it will have all Restful verbs functions
      return axios.get(`ENDPOINT_GOES_HERE`)
      .then((res: { data: any; }) => {
        return res.data;
      });
      */
  }
  async dbCall({ path, body, method }: { path: string, body: string, method: string }): Promise<any> {
    const apiData = await fetch(path, {
      body: body,
      method: method,
      headers: {
        "content-type": "application/json"
      }
    });

    return await apiData.json();
  }
  async addBoard(title: string): Promise<unknown> {
    const apiData = await fetch("http://localhost:5058/api/universal?t=insert_board", {
      body: JSON.stringify({ title }),
      method: "POST",
      headers: {
        "content-type": "application/json"
      }
    });

    return await apiData.json();
  }
} //BoardAPI Class End

//Business Layer
export async function fetchBoardList(): Promise<IBoard[]> {
  const api = new BoardAPI();
  console.log("fetch boards")

  return api.fetchBoardList();
}

export async function dbInsert(title: string) {
  const api = new BoardAPI();

  return api.addBoard(title);

}

export function updateLocalStorageBoards(boards: IBoard[]) {
  console.log("gets updated")
  localStorage.setItem(LocalStorageKeyName, JSON.stringify(boards));
}

export async function dbApiCall({ method, query, parameters }: IDBCall) {
  const api = new BoardAPI();

  let path = settings.API + `universal?t=${query}`;
  const body: Record<string, unknown> = {};
  const ignore = ['t', 'where'];

  try {
    for (const key in parameters) {
      if (Object.prototype.hasOwnProperty.call(parameters, key)) {
        if (method === 'GET' && !ignore.includes(key)) 
          path += `&${key}=${parameters[key]}`

        if(method !== 'GET')
          body[key] = parameters[key];
      }
    }

    const res = await api.dbCall({ path, body: JSON.stringify(body), method })

    if (res["Error"]) { 
      throw new Error(res['Error'] || "Unknown error");
    }
    
    return res;

  } catch (error) {
    toast(getErrorMessage(error), {type: 'error'});
  }
}