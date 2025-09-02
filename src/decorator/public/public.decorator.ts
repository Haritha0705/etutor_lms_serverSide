import { SetMetadata } from '@nestjs/common';

export const PUBLIC_DEC_KEY = 'public';
export const Public = (val?: boolean) => SetMetadata(PUBLIC_DEC_KEY, val !== undefined ? val : true);
