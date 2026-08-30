const ADMINISTRATOR = BigInt(0x8);

export function isAdministrator(permissions: string): boolean {
  try {
    return (BigInt(permissions) & ADMINISTRATOR) === ADMINISTRATOR;
  } catch {
    return false;
  }
}
