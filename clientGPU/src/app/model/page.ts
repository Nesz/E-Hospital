import { OrderDirection } from "./order-direction";

export interface Page<T> {
  pageCurrent: number,
  pageOrder: string,
  pageSize: number,
  pageTotal: number,
  orderDirection: OrderDirection,
  data: T[]
}
