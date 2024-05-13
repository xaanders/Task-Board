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

export interface IBoard {
  category_id: number;
  title: string;
  cards: ICard[];
  project_id: number;
}
export interface IProject {
  project_id?: number;
  project_name: string;
  current?: boolean
}
export interface IDBCall {
  method: string,
  query?: string,
  table?: string,
  parameters?: Record<string, unknown>
}

export interface IApiCall {
  headers?: any;
  method: string;
  body?: string;
}