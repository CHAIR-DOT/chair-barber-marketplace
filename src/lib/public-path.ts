/** Prefix native public URLs without changing stored paths or uploaded images. */
export function publicPath(path: string): string;
export function publicPath(path: undefined): undefined;
export function publicPath(path: string | undefined): string | undefined;
export function publicPath(path: string | undefined): string | undefined {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (
    !path ||
    !basePath ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path === basePath ||
    path.startsWith(`${basePath}/`) ||
    path.startsWith(`${basePath}?`) ||
    path.startsWith(`${basePath}#`)
  ) {
    return path;
  }
  return `${basePath}${path}`;
}
