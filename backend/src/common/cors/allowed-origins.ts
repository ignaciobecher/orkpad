const LOCAL_DEV_ORIGINS = ['http://localhost:5173'];

export function buildAllowedOrigins(frontendUrl?: string): string[] {
  const origins = [...(frontendUrl ? [frontendUrl] : []), ...LOCAL_DEV_ORIGINS];
  return [...new Set(origins)];
}
