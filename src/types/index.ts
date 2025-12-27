export interface TItem {
  id: number;
  selected: boolean;
  order: number | null;
}

export interface IGetItemsResult {
  items: TItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IGetItemsRequest {
  page: number;
  limit: number;
  filter?: string;
  selectedOnly?: boolean;
}

export interface IOperatedItemResult {
  success: boolean;
  message?: string;
  item?: TItem;
}

export interface IOperatedItemRequest {
  id: number;
}

export interface IReorderItemsRequest {
  order: number[];
}
