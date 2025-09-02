import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';
import { NO_CACHE_KEY } from '../../decorator/no-cache/no-cache.decorator';

@Injectable()
export class ApiCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    protected readonly reflector: Reflector,
  ) {
    super(cacheManager, reflector);
  }

  protected isRequestCacheable(context: ExecutionContext): boolean {
    const noCache = this.reflector.getAllAndOverride<boolean>(NO_CACHE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (noCache) return false;

    return super.isRequestCacheable(context);
  }
}
