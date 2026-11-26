(() => {
  const missingState = /missing initial state|缺少初始狀態|缺少初始状态/i;
  const showRecovery = () => {
    if (!missingState.test(document.body.textContent)) return;
    observer.disconnect();
    document.documentElement.lang = 'zh-TW';
    document.title = '重新開始 Google 登入';
    const main = document.createElement('main');
    main.style.cssText = 'max-width:30rem;margin:12vh auto;padding:1.5rem;color:#0f172a;font:1rem/1.65 system-ui,sans-serif';
    const title = document.createElement('h1');
    title.textContent = '需要重新登入';
    const message = document.createElement('p');
    message.textContent = '瀏覽器未保留這次的 Google 登入狀態。請回商城重新開始。若你從社群 App 開啟，請改用 Chrome 或 Safari。';
    const link = document.createElement('a');
    link.href = '/profile?googleSignIn=retry';
    link.textContent = '回商城登入';
    link.style.cssText = 'display:inline-block;background:#4338ca;color:white;border-radius:.65rem;padding:.65rem 1rem;text-decoration:none';
    main.append(title, message, link);
    document.body.replaceChildren(main);
  };
  const observer = new MutationObserver(showRecovery);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  showRecovery();
})();
