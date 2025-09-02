import { SetMetadata } from '@nestjs/common';
import { Role } from '../../enum/role.enum';

export const ROLE_DEC_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLE_DEC_KEY, roles);
