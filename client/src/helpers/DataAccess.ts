import { toast } from "react-toastify";
import { IApiCall, IDBCall, IUserLogin, IUserTokenResponse } from "../types/interfaces";
import { getErrorMessage, settings } from "./helpers";
import { RequestMethod } from "../types/types";
export class BoardAPI {
  async sendRequest({ path, body, method, accessToken, httpOnly }: { path: string, body?: string, method: RequestMethod, accessToken?: string | null, httpOnly?: boolean }): Promise<any> {

    const reqObj: IApiCall = {
      body,
      method,
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "content-type": "application/json",
      }
    }

    if (httpOnly) {
      reqObj.credentials = 'include';
      delete reqObj.headers["Authorization"]
    }
    if (method === "GET") {
      delete reqObj.body
    }

    const apiData = await fetch(path, reqObj);
    return await apiData.json();
  }
}

export async function dbApiCall({ method = 'POST', query, accessToken, parameters = {} }: IDBCall) {
  if (!accessToken)
    throw new Error("No token found");

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

    const res = await api.sendRequest({ path, body: JSON.stringify(body), accessToken, method })

    if (res.error || res.Error) {
      throw new Error(res.error || res.Error || "Unknown error");
    }

    return res;

  } catch (error:any) {
    toast(getErrorMessage(error), { type: 'error' });
    return {error: true};
  }
}

export async function apiCall({ method, accessToken, httpOnly, parameters }: IDBCall) {

  const api = new BoardAPI();

  const apiGate = parameters?.apiGate || "universal"

  let path = settings.API + apiGate;

  if (parameters?.apiGate)
    delete parameters.apiGate

  try {
    if (method === 'GET' && parameters && Object.keys(parameters).length > 0) {
      Object.keys(parameters).forEach((key, i) => {
        if (i === 0)
          path += `?${key}=${parameters[key]}`
        else
          path += `&${key}=${parameters[key]}`
      })
    }

    const res = await api.sendRequest({ path, body: JSON.stringify(parameters), method, accessToken, httpOnly })
    console.log(res)
    if (res && (res.Error || res.error)) {
      throw new Error(res.Error || res.error || "Unknown error");
    }

    return res;

  } catch (error: any) {
    toast(error.message, { type: 'error' });
  }
}


export async function getRefreshToken() {
  const response: IUserTokenResponse = await apiCall({ method: 'GET', httpOnly: true, parameters: { apiGate: 'refresh-token' } });
  return response;
}

export async function signUserIn(userData: IUserLogin) {
  const response: IUserTokenResponse = await apiCall({ method: 'POST', httpOnly: true, parameters: { ...userData, apiGate: 'signin' } });

  return response;
}

export async function signUserOut() {
  const response: IUserTokenResponse = await apiCall({ method: 'POST', httpOnly: true, parameters: { apiGate: 'signOut' } })

  return response;
}