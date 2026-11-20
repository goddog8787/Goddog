import assert from 'node:assert/strict';
import test from 'node:test';
import { dispatchGeminiStream } from '../src/lib/geminiClient';

test('the chat accepts only complete replies from the selected Gemini model', async t => {
  const config = { message: 'PETG', model: 'gemini-4-hydrogen' };
  const reply = { text: 'fresh provider answer' };
  const confirmation = { meta: { source: 'gemini', modelId: config.model, modelUsed: 'Gemini 4 Hydrogen' } };
  let events: unknown[] = [];
  t.mock.method(globalThis, 'fetch', async () => new Response(
    events.map(event => `data: ${event === '[DONE]' ? event : JSON.stringify(event)}\n\n`).join(''),
    { headers: { 'Content-Type': 'text/event-stream' } },
  ));

  events = [{ meta: { modelUsed: 'Gemini 4 Hydrogen' } }, reply, '[DONE]'];
  assert.equal(await dispatchGeminiStream(config), null);

  events = [{ meta: { ...confirmation.meta, modelId: 'gemini-3.1-flash-lite' } }, reply, '[DONE]'];
  assert.equal(await dispatchGeminiStream(config), null);

  events = [confirmation, reply, { error: 'MODEL_UNAVAILABLE' }, '[DONE]'];
  assert.equal(await dispatchGeminiStream(config), null);

  events = [confirmation, reply, '[DONE]'];
  assert.deepEqual(await dispatchGeminiStream(config), {
    reply: reply.text, modelUsed: confirmation.meta.modelUsed, modelId: config.model,
  });
});
