import { SetMetadata } from '@nestjs/common';

export const NO_CACHE_KEY = 'no-cache';
export const NoCache = (...args: string[]) => SetMetadata('no-cache', args);
