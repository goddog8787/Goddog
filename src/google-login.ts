const status = document.querySelector<HTMLParagraphElement>('#status')!;
const retry = document.querySelector<HTMLAnchorElement>('#retry')!;
const slow = window.setTimeout(() => {
  status.textContent = '連線時間較長，你可以繼續等待或重新嘗試。';
  retry.hidden = false;
}, 12_000);

async function start() {
  try {
    const { runGoogleLoginPage, googleLoginError } = await import('./lib/firebase');
    try {
      await runGoogleLoginPage();
    } catch (error) {
      status.textContent = googleLoginError(error);
      retry.hidden = false;
    }
  } catch {
    status.textContent = '登入元件載入失敗，請重新嘗試。';
    retry.hidden = false;
  } finally {
    window.clearTimeout(slow);
  }
}
void start();
