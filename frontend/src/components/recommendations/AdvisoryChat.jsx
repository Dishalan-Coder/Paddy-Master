import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  CheckCircle2,
  LoaderCircle,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import recommendationService from '../../services/recommendationService';
import ErrorAlert from '../common/ErrorAlert';
import { getApiErrorMessage } from '../../utils/forms';

const MAX_MESSAGE_LENGTH = 1000;

const makeMessage = (role, content, extra = {}) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  content,
  ...extra,
});

export default function AdvisoryChat() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState(() => [
    makeMessage('assistant', t('pages.recommendations.chat.welcome')),
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const submit = async (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    setError('');
    setInput('');
    setSending(true);
    setMessages((current) => [...current, makeMessage('user', question)]);

    try {
      const response = await recommendationService.chat(question);
      setMessages((current) => [
        ...current,
        makeMessage('assistant', response.reply, {
          source: response.advisory_source,
          suggestions: response.suggested_actions || [],
        }),
      ]);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          t('pages.recommendations.chat.error'),
        ),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="flex h-[560px] min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-slate-900">
              {t('pages.recommendations.chat.title')}
            </h2>
            <p className="truncate text-sm text-slate-500">
              {t('pages.recommendations.chat.subtitle')}
            </p>
          </div>
        </div>
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          const Icon = isUser ? UserRound : Bot;

          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                  isUser
                    ? 'bg-emerald-700 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                {!isUser && message.source && (
                  <p className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">
                    {message.source === 'openai'
                      ? t('pages.recommendations.chat.ai_source')
                      : t('pages.recommendations.chat.rules_source')}
                  </p>
                )}
                {!isUser && message.suggestions?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion) => (
                      <p
                        key={suggestion}
                        className="flex items-start gap-2 text-xs font-semibold text-slate-600"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span className="break-words">{suggestion}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
              {isUser && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                  <Icon className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
        {sending && (
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin text-emerald-700" />
            {t('pages.recommendations.chat.thinking')}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-100 p-4">
        <ErrorAlert message={error} onDismiss={() => setError('')} />
        <form onSubmit={submit} className="mt-3 flex items-end gap-3">
          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value.slice(0, MAX_MESSAGE_LENGTH))
            }
            placeholder={t('pages.recommendations.chat.placeholder')}
            rows={2}
            className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t('pages.recommendations.chat.send')}
            title={t('pages.recommendations.chat.send')}
          >
            {sending ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
