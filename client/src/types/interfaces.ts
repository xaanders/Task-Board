import { RequestMethod } from "./types";

export interface IUser {
  id: string;
  email: string;
  name: string;
  is_email_confirmed: number;
}
export interface ILabel {
  label_id?: number;
  color: string;
  text: string;
  card_id?: number;
  status?: number;

}

export interface ITask {
  task_id?: number;
  completed: boolean;
  text: string;
  card_id?: number;
  status?: number;
}

export interface ICard {
  card_id: number;
  title: string;
  labels: ILabel[];
  date?: string;
  tasks: ITask[];
  description?: string;
  category_id?: number;
}

export interface ICategory {
  category_id: number;
  title: string;
  cards: ICard[];
  board_id: number;
}
export interface IBoard {
  board_id: number;
  board_name: string;
}

export interface IProject {
  project_id?: number;
  project_name: string;
}
export interface IDBCall {
  method: RequestMethod;
  query?: string;
  table?: string;
  httpOnly?: boolean;
  accessToken?: string | null;
  parameters?: Record<string, unknown>
}

export interface IApiCall {
  headers?: any;
  method: RequestMethod;
  body?: string;
  credentials?: RequestCredentials;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserAccess {
  idToken: string;
  refreshToken: string;
  accessToken: string;
}

export interface IUserTokenResponse {
  user?: IUser;
  accessToken?: string;
  message?: string;
  noUser?: boolean;
  isSignOut?: boolean;
}