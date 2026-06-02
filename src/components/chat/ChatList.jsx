import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiSearch } from 'react-icons/fi';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import { timeAgo } from '../../utils/formatters';

export default function ChatList({ conversations }) {
  var t = useTranslation().t;

  if (!conversations || conversations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">💬</div>
        <h3 className="text-lg font-semibold text-vibe-text-muted">{t('chat.noMessages')}</h3>
        <p className="text-sm text-vibe-gray-light mt-1">{t('chat.startChat')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map(function (conv) {
        var otherUser = conv.participants && conv.participants.find(function (p) { return p._id !== conv.currentUserId; });
        var isGroup = conv.type === 'group';
        var unreadCount = conv.unreadCount || 0;

        return (
          <Link
            key={conv._id}
            to={'/messages/' + conv._id}
            className={'flex items-center gap-3 p-3 rounded-xl transition hover:bg-vibe-gray ' + (unreadCount > 0 ? 'bg-vibe-gray/50' : '')}
          >
            {isGroup ? (
              <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg">
                {(conv.name || 'G').charAt(0)}
              </div>
            ) : (
              <Avatar
                src={otherUser && otherUser.avatar}
                alt={otherUser && (otherUser.firstName + ' ' + otherUser.lastName)}
                size="lg"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className={'font-semibold text-sm truncate ' + (unreadCount > 0 ? 'text-white' : 'text-vibe-text-muted')}>
                    {isGroup ? conv.name : (otherUser && (otherUser.firstName + ' ' + otherUser.lastName))}
                  </span>
                  {otherUser && otherUser.isVerified && <VerifiedBadge size="xs" />}
                </div>
                <span className="text-xs text-vibe-gray-light shrink-0">
                  {conv.lastMessage && timeAgo(conv.lastMessage.sentAt)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-sm text-vibe-gray-light truncate">
                  {conv.lastMessage ? (conv.lastMessage.type === 'text' ? conv.lastMessage.content : '📎 Attachment') : t('chat.startChat')}
                </p>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 gradient-bg text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 ml-2">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}