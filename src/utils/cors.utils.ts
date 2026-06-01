export function getCleanOrigins(rawOrigins: string | undefined): string[] {
  return rawOrigins
    ? rawOrigins
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : ['http://localhost:8081', 'http://localhost:3000'];
}
