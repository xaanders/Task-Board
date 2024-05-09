export interface ILabel {
    label_id?: number;
    color: string;
    text: string;
  }
  
  export interface ITask {
    task_id?: number;
    completed: boolean;
    text: string;
  }
  
  export interface ICard {
    card_id: number;
    title: string;
    labels: ILabel[];
    date: string;
    tasks: ITask[];
    description?: string;
  }
  
  export interface IBoard {
    category_id: number;
    title: string;
    cards: ICard[];
  }
  
  export interface IDBCall {
    method: string, 
    query: string, 
    parameters: Record<string, unknown>
  }
