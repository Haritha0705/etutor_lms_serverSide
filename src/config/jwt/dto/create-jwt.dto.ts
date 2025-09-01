import { Role } from '../../../enum/role.enum';

export class CreateJwt {
  id: number;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
