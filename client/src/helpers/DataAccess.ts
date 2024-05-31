import { toast } from "react-toastify";
import { IApiCall, IDBCall } from "../types/interfaces";
import { getErrorMessage, settings } from "./helpers";

export class BoardAPI {
  async dbCall({ path, body, method }: { path: string, body?: string, method: string }): Promise<any> {
    const reqObj: IApiCall = {
      body: body,
      method: method,
      headers: {
        "content-type": "application/json"
      }
    }

    if (method === "GET") {
      delete reqObj.body
      delete reqObj.headers
    }

    const apiData = await fetch(path, reqObj);

    return await apiData.json();
  }
}

export async function dbApiCall({ method = 'POST', query, parameters = {} }: IDBCall) {
  const api = new BoardAPI();

  let path = settings.API + `universal?t=${query}`;
  const body: Record<string, unknown> = {};
  const ignore = ['t', 'where'];

  try {
    for (const key in parameters) {
      if (Object.prototype.hasOwnProperty.call(parameters, key)) {
        if (method === 'GET' && !ignore.includes(key))
          path += `&${key}=${parameters[key]}`

        if (method !== 'GET')
          body[key] = parameters[key];
      }
    }

    const res = await api.dbCall({ path, body: JSON.stringify(body), method })

    if (res["Error"]) {
      throw new Error(res['Error'] || "Unknown error");
    }

    return res;

  } catch (error) {
    toast(getErrorMessage(error), { type: 'error' });
  }
}

export async function apiCall({ method, parameters }: IDBCall) {
  const api = new BoardAPI();

  const apiGate = parameters?.apiGate || "universal"

  let path = settings.API + apiGate;

  if(parameters?.apiGate)
    delete parameters.apiGate

  try {

    if (method === 'GET' && parameters && Object.keys(parameters).length > 0) {

      Object.keys(parameters).forEach((key, i) => {
        if(i === 0)
          path += `?${key}=${parameters[key]}`
        else 
          path += `&${key}=${parameters[key]}`
      })

    }

    const res = await api.dbCall({ path, body: JSON.stringify(parameters), method })

    if (res['Error']) {
      throw new Error(res['Error'] || "Unknown error");
    }

    return res;

  } catch (error) {
    toast(getErrorMessage(error), { type: 'error' });
  }
}

