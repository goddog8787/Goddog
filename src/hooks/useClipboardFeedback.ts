import { useEffect, useRef, useState } from 'react';
import type { LanguageCode } from '../types';

export function useClipboardFeedback(lang: LanguageCode = 'zh-TW') {
  const [feedback, setFeedback] = useState<{ key: string; copied: boolean } | null>(null);
  const revision = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => {
    revision.current++;
    clearTimeout(timer.current);
  }, []);

  async function copy(text: string, key = text): Promise<boolean> {
    const request = ++revision.current;
    clearTimeout(timer.current);
    setFeedback(null);
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      // Clipboard access can be blocked by the browser or missing in an embedded page.
    }
    if (request === revision.current) {
      setFeedback({ key, copied });
      timer.current = setTimeout(() => setFeedback(null), copied ? 2000 : 5000);
    }
    return copied;
  }

  const errorText = lang === 'en' ? 'Copy failed' : lang === 'ja' ? 'コピーできませんでした' : '複製失敗';
  return { copy, copiedKey: feedback?.copied ? feedback.key : null, failedKey: feedback && !feedback.copied ? feedback.key : null, errorText };
}
