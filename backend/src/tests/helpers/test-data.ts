export function generateUniqueUserData(overrides = {}) {
  const id = Date.now() + Math.random().toString(36).substring(7);

  return {
    name: `Test User ${id}`,
    email: `test-${id}@example.com`,
    googleId: `google-${id}`,
    profilePictureUrl: 'http://example.com/profile.jpg',
    ...overrides,
  };
}
