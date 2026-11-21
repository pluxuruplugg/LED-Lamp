const storageKey = "autogid.anonymousVisitor";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// No contacts or IP addresses. If storage is blocked, skip analytics rather than inventing
// a new visitor on every reload. Orders remain fully functional without tracking.
export function anonymousVisitor(storage: Pick<Storage, "getItem" | "setItem">, random: () => string): string | null {
  try {
    const existing = storage.getItem(storageKey);
    if (existing && uuid.test(existing)) return existing;
    const id = random();
    if (!uuid.test(id)) return null;
    storage.setItem(storageKey, id);
    return id;
  } catch { return null; }
}
