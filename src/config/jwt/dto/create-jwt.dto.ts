import { Role } from '../../../enum/role.enum';

export class CreateJwt {
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
