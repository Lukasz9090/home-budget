/** Returns `returnUrl` only when it is an internal path (`/…`, not `//…` or `/\…`), else `/`. */
export function safeReturnUrl(returnUrl: string | null | undefined): string {
  if (
    !returnUrl ||
    !returnUrl.startsWith('/') ||
    returnUrl.startsWith('//') ||
    returnUrl.startsWith('/\\')
  ) {
    return '/';
  }
  return returnUrl;
}
