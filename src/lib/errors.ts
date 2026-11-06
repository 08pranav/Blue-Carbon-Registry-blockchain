// Helpers for working with `unknown` caught values (ethers/MetaMask errors are plain objects).

export function errorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const e = error as { shortMessage?: unknown; message?: unknown };
    if (typeof e.shortMessage === 'string' && e.shortMessage) return e.shortMessage;
    if (typeof e.message === 'string') return e.message;
  }
  return '';
}

/** EIP-1193 / MetaMask numeric error code (e.g. 4001 = user rejected, 4902 = chain not added). */
export function errorCode(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'number') return code;
  }
  return undefined;
}

export function isUserRejection(error: unknown): boolean {
  return errorCode(error) === 4001 || /user rejected|user denied/i.test(errorMessage(error));
}
