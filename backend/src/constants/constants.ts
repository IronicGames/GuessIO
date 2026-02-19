export const API_ROUTES = {
  ROOT: '/api',
  HEALTH: '/health',
  AUTH: '/auth',
};

export function getApiRoute(route: string): string {
  return `${API_ROUTES.ROOT}${route}`;
}
