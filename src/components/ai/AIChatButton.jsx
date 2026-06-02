import { useState } from 'react';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';

export default function AIChatButton() {
  var open = useState(false)[0];
  var setOpen = useState(false)[1];
  var messages = useState([
    { from: 'ai', text: 'Hey! 👋 I\'m your Vibe AI assistant. Ask me anything — help with posts, captions, hashtags, or growing your audience!' },
  ])[0];
  var setMessages = useState([])[1];
  var input = useState('')[0];
  var setInput = useState('')[1];

  var handleSend = function () {
    if (!input.trim()) return;
    var newMessages = messages.concat([{ from: 'user', text: input }]);
    setMessages(newMessages);
    setInput('');

    setTimeout(function () {
      setMessages(newMessages.concat([{ from: 'ai', text: 'That\'s a great question! Let me help you with that. 🚀' }]));
    }, 1000);
  };

  return (
    <>
      <button
        onClick={function () { setOpen(!open); }}
        className="fixed bottom-20 right-4 lg:bottom-6 w-14 h-14 gradient-bg rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition z-40"
      >
        {open ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-36 right-4 lg:bottom-24 w-80 sm:w-96 h-96 bg-vibe-dark rounded-2xl border border-vibe-gray-light shadow-2xl flex flex-col z-40 animate-slide-up">
          <div className="gradient-bg p-4 rounded-t-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm">🤖</div>
            <div>
              <div className="font-semibold text-white text-sm">HDM AI Assistant</div>
              <div className="text-xs text-white/70">Powered by HDM AI</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(function (msg, i) {
              return (
                <div key={i} className={'flex ' + (msg.from === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={'max-w-[80%] px-4 py-2 rounded-xl text-sm ' + (msg.from === 'user' ? 'gradient-bg text-white' : 'bg-vibe-gray text-white')}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-vibe-gray-light flex gap-2">
            <input
              type="text"
              value={input}
              onChange={function (e) { setInput(e.target.value); }}
              onKeyDown={function (e) { if (e.key === 'Enter') handleSend(); }}
              placeholder="Ask HDM AI..."
              className="flex-1 bg-vibe-gray border border-vibe-gray-light rounded-xl px-3 py-2 text-sm text-white placeholder-vibe-text-muted focus:outline-none focus:border-vibe-blue"
            />
            <button onClick={handleSend} className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center text-white shrink-0">
              <FiSend size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}