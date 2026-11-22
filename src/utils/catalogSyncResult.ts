export async function waitForCatalogCloudSync(sync: Promise<boolean>, timeoutMs = 8000): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([sync, new Promise<boolean>(resolve => {
      timer = setTimeout(() => resolve(false), timeoutMs);
    })]);
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
