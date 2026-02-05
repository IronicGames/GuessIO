export const API_ROUTES = {
  ROOT: '/api',
  HEALTH: '/health',
};

export function getApiRoute(route: string): string {
  return `${API_ROUTES.ROOT}${route}`;
}
