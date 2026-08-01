import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import { formatDateTime } from '../../utils/formatters';
export default function ChatBox({ receiverId, conversationId, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottom = useRef(null);
  const cId = conversationId || `${user.id}-${receiverId}`;
  useEffect(() => {
    chatService
      .getMessages(cId)
      .then(setMsgs)
      .catch(() => {});
  }, [cId]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const m = await chatService.send(cId, receiverId, text.trim());
      setMsgs((p) => [...p, m]);
      setText('');
    } catch (e) {
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-2xl border flex flex-col z-50 animate-fadeIn">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h4 className="font-semibold">{t('chat.title')}</h4>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            {t('chat.empty')}
          </p>
        )}
        {msgs.map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <div
              key={m._id}
              className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${mine ? 'bg-paddy-700 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}
              >
                <p>{m.content}</p>
                <p
                  className={`text-[10px] mt-1 ${mine ? 'text-paddy-200' : 'text-gray-400'}`}
                >
                  {formatDateTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      <form onSubmit={send} className="flex items-center gap-2 p-3 border-t">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('chat.placeholder')}
          className="flex-1 text-sm outline-none bg-gray-50 rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2 bg-paddy-700 text-white rounded-lg hover:bg-paddy-800 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
