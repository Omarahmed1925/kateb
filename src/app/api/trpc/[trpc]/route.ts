import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export async function GET(request: Request): Promise<Response> {
  const { appRouter } = await import('@/server/routers');
  const { createContext } = await import('@/server/context');

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext,
  });
}

export async function POST(request: Request): Promise<Response> {
  const { appRouter } = await import('@/server/routers');
  const { createContext } = await import('@/server/context');

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext,
  });
}


