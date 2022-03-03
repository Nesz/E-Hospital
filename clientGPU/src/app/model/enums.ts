export enum OrderDirection {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}

export enum Role {
  Admin = 'Admin',
  Doctor = 'Doctor',
  Patient = 'Patient'
}

export interface Page<T> {
  pageCurrent: number,
  pageOrder: string,
  pageSize: number,
  pageTotal: number,
  orderDirection: OrderDirection,
  data: T[]
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export enum Orientation {
  X, Y, Z
}
