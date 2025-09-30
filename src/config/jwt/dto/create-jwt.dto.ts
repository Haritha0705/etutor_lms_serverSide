import { Role } from '../../../enum/role.enum';

export class CreateJwt {
  userId: number;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
