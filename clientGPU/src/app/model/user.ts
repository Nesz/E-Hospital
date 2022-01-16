import { Role } from "./role";
import { Gender } from "./gender";

export interface User {
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  birthDate: string,
  role: Role,
  gender: Gender
}
