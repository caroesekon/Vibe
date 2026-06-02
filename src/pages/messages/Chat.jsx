// src/pages/messages/Chat.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiPhone, FiVideo, FiSend, FiSmile, FiPaperclip,
  FiMoreVertical, FiVolumeX, FiVolume2, FiTrash2, FiCheck, FiFile,
} from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { getSocket } from '../../api/socket';
import useAuthStore from '../../store/useAuthStore';
import useChatStore from '../../store/useChatStore';
import Avatar from '../../components/common/Avatar';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import Loader from '../../components/common/Loader';
import { timeAgo, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

function MessageStatus({ msg, user }) {
  if (!msg.sender || !user) return null;
  var senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
  var isMine = senderId === user._id;
  if (!isMine) return null;
  var hasRead = msg.readBy && msg.readBy.length > 0;
  var hasDelivered = msg.deliveredTo && msg.deliveredTo.length > 0;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 4 }}>
      <FiCheck size={14} color={hasRead ? '#3B82F6' : hasDelivered ? '#94A3B8' : '#64748B'} />
      {(hasDelivered || hasRead) && (
        <FiCheck size={14} color={hasRead ? '#3B82F6' : '#94A3B8'} style={{ marginLeft: -10 }} />
      )}
    </span>
  );
}

function DateDivider({ date }) {
  if (!date) return null;
  return (
    <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
      <span style={{ fontSize: 11, color: '#64748B', background: '#0F172A', padding: '4px 12px', borderRadius: 10, border: '1px solid #1E293B' }}>{date}</span>
    </div>
  );
}

export default function Chat() {
  var conversationId = useParams().id;
  var user = useAuthStore(function (s) { return s.user; });
  var messages = useChatStore(function (s) { return s.messages; });
  var fetchMessages = useChatStore(function (s) { return s.fetchMessages; });
  var setActiveConversation = useChatStore(function (s) { return s.setActiveConversation; });
  var markRead = useChatStore(function (s) { return s.markRead; });
  var addMessage = useChatStore(function (s) { return s.addMessage; });

  var contentState = useState('');
  var content = contentState[0];
  var setContent = contentState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var convState = useState(null);
  var conversation = convState[0];
  var setConversation = convState[1];

  var showMenuState = useState(false);
  var showMenu = showMenuState[0];
  var setShowMenu = showMenuState[1];

  var showEmojiState = useState(false);
  var showEmoji = showEmojiState[0];
  var setShowEmoji = showEmojiState[1];

  var mutedState = useState(false);
  var muted = mutedState[0];
  var setMuted = mutedState[1];

  var fileRef = useRef(null);
  var messagesEndRef = useRef(null);
  var socketRef = useRef(null);

  var scrollToBottom = function () {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(function () { scrollToBottom(); }, [messages]);

  useEffect(function () {
    loadChat();
    setActiveConversation(conversationId);

    var socket = getSocket();
    socketRef.current = socket;
    if (socket) {
      socket.emit('join:conversation', conversationId);

      var msgHandler = function (msg) {
        if (msg.conversation === conversationId || msg.conversation === conversationId) {
          addMessage(msg);
          markRead(conversationId);
          setTimeout(scrollToBottom, 100);
        }
      };

      var readHandler = function () {
        fetchMessages(conversationId);
      };

      socket.on('message:new', msgHandler);
      socket.on('message:read', readHandler);
    }

    return function () {
      if (socket) {
        socket.off('message:new', msgHandler);
        socket.off('message:read', readHandler);
        socket.emit('leave:conversation', conversationId);
      }
      setActiveConversation(null);
    };
  }, [conversationId]);

  var loadChat = async function () {
    setLoading(true);
    try {
      var conversations = useChatStore.getState().conversations;
      var conv = conversations.find(function (c) { return c._id === conversationId; });
      setConversation(conv || null);
      if (conv) {
        var isMuted = conv.muted && conv.muted.some(function (m) { return m === user._id; });
        setMuted(!!isMuted);
      }
      await fetchMessages(conversationId);
      await markRead(conversationId);
      setTimeout(scrollToBottom, 200);
    } catch (err) {}
    setLoading(false);
  };

  var handleSend = async function (e) {
    e.preventDefault();
    var text = content.trim();
    if (!text) return;
    setContent('');
    try {
      var res = await API.post(ENDPOINTS.MESSAGES.SEND(conversationId), { type: 'text', content: text });
      addMessage(res.data.data);
      setTimeout(scrollToBottom, 100);

      if (conversation && conversation.type === 'ai') {
        setTimeout(function () {
          fetchMessages(conversationId);
          setTimeout(scrollToBottom, 200);
        }, 2000);
      }
    } catch (err) {
      toast.error('Failed to send');
      setContent(text);
    }
  };

  var handleFileUpload = async function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var formData = new FormData();
    formData.append('attachment', file);
    try {
      var res = await API.post(ENDPOINTS.MESSAGES.SEND(conversationId), formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      addMessage(res.data.data);
      setTimeout(scrollToBottom, 100);
    } catch (err) { toast.error('Upload failed'); }
    if (fileRef.current) fileRef.current.value = '';
  };

  var handleMute = async function () {
    try {
      if (muted) { await API.put(ENDPOINTS.MESSAGES.UNMUTE(conversationId)); setMuted(false); toast.success('Unmuted'); }
      else { await API.put(ENDPOINTS.MESSAGES.MUTE(conversationId)); setMuted(true); toast.success('Muted'); }
      setShowMenu(false);
    } catch (err) { toast.error('Failed'); }
  };

  var handleClear = async function () {
    try {
      await API.delete('/messages/conversations/' + conversationId);
      useChatStore.setState({ messages: [] });
      toast.success('Chat cleared');
      setShowMenu(false);
    } catch (err) { toast.error('Failed to clear'); }
  };

  var handleEmojiClick = function (emojiData) {
    setContent(content + emojiData.emoji);
    setShowEmoji(false);
  };

  var isSystem = conversation && (conversation.isSystem || conversation.type === 'broadcast' || conversation.type === 'ai');
  var other = null;
  if (conversation && conversation.participants && !isSystem) {
    other = conversation.participants.find(function (p) { var pid = typeof p === 'object' ? (p._id || p) : p; return pid !== user._id; });
  }
  var name = isSystem ? (conversation && conversation.name) || 'System' : (other ? (other.firstName || '') + ' ' + (other.lastName || '') : 'Chat').trim();
  var avatar = isSystem ? '' : (other ? other.avatar : '');
  var isOnline = !isSystem && other && other.isOnline;
  var isVerified = isSystem || (other && other.isVerified);
  var username = other ? other.username : '';

  if (loading) return <Loader className="py-20" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', background: '#020617', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #1E293B', flexShrink: 0, background: '#020617' }}>
        <Link to="/messages" style={{ color: '#64748B', padding: 4, flexShrink: 0 }}><FiArrowLeft size={20} /></Link>
        <Link to={isSystem ? '#' : '/' + username} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flex: 1, minWidth: 0 }}>
          {isSystem ? (
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: conversation && conversation.systemType === 'hdm_ai' ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
              {conversation && conversation.systemType === 'hdm_ai' ? '🤖' : 'V'}
            </div>
          ) : (<Avatar src={avatar} alt={name} size="sm" />)}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
              {isVerified && <VerifiedBadge size="xs" />}
              {isSystem && <span style={{ fontSize: 9, background: '#1E293B', color: '#94A3B8', padding: '1px 5px', borderRadius: 4 }}>OFFICIAL</span>}
            </div>
            <div style={{ fontSize: 11, color: isOnline ? '#10B981' : '#64748B' }}>{isSystem ? 'System' : isOnline ? 'Online' : 'Offline'}</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0, position: 'relative' }}>
          {!isSystem && <button style={iconBtn}><FiPhone size={17} /></button>}
          {!isSystem && <button style={iconBtn}><FiVideo size={17} /></button>}
          <button onClick={function () { setShowMenu(!showMenu); }} style={iconBtn}><FiMoreVertical size={17} /></button>
          {showMenu && (
            <div style={{ position: 'absolute', right: 0, top: 36, background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, padding: 4, width: 170, zIndex: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <button onClick={handleMute} style={menuStyle}>{muted ? <FiVolume2 size={14} /> : <FiVolumeX size={14} />}<span style={{ marginLeft: 8 }}>{muted ? 'Unmute' : 'Mute'}</span></button>
              <button onClick={handleClear} style={{ ...menuStyle, color: '#EF4444' }}><FiTrash2 size={14} /><span style={{ marginLeft: 8 }}>Clear Chat</span></button>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {messages.map(function (msg, i) {
          var senderId = msg.sender && (typeof msg.sender === 'object' ? msg.sender._id : msg.sender);
          var isMine = senderId === user._id;
          var prevMsg = i > 0 ? messages[i - 1] : null;
          var showDivider = i === 0 || formatDate(prevMsg.createdAt) !== formatDate(msg.createdAt);

          return (
            <div key={msg._id}>
              {showDivider && <DateDivider date={formatDate(msg.createdAt)} />}
              <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', padding: '1px 12px', alignItems: 'flex-end' }}>
                {!isMine && <Avatar src={msg.sender && msg.sender.avatar} alt="" size="xs" style={{ marginRight: 6, marginBottom: 2, flexShrink: 0 }} />}
                <div style={{ maxWidth: '72%' }}>
                  {msg.type === 'image' && msg.media && msg.media.url ? (
                    <img src={msg.media.url} alt="" style={{ maxWidth: 240, maxHeight: 300, borderRadius: 16, objectFit: 'cover' }} />
                  ) : msg.type === 'video' && msg.media && msg.media.url ? (
                    <video src={msg.media.url} controls style={{ maxWidth: 240, maxHeight: 300, borderRadius: 16 }} />
                  ) : msg.type === 'file' && msg.media ? (
                    <a href={msg.media.url || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: isMine ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : '#1E293B', borderRadius: 14, color: 'white', textDecoration: 'none', fontSize: 13 }}>
                      <FiFile size={18} /> {msg.media.fileName || 'File'}
                    </a>
                  ) : (
                    <div style={{ padding: '10px 14px', borderRadius: 16, fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word', background: isMine ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : '#1E293B', color: 'white', borderBottomRightRadius: isMine ? 4 : 16, borderBottomLeftRadius: isMine ? 16 : 4 }}>
                      {msg.content}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2, textAlign: isMine ? 'right' : 'left', padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    {timeAgo(msg.createdAt)}
                    <MessageStatus msg={msg} user={user} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {showEmoji && (
        <div style={{ position: 'absolute', bottom: 56, right: 16, zIndex: 30 }}>
          <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" width={320} height={380} />
        </div>
      )}

      <form onSubmit={handleSend} style={{ display: 'flex', gap: 6, padding: '8px 12px', borderTop: '1px solid #1E293B', flexShrink: 0, alignItems: 'center', position: 'relative', background: '#020617' }}>
        <input ref={fileRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.zip" onChange={handleFileUpload} style={{ display: 'none' }} />
        <button type="button" onClick={function () { fileRef.current && fileRef.current.click(); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 8, flexShrink: 0 }}><FiPaperclip size={20} /></button>
        <input type="text" value={content} onChange={function (e) { setContent(e.target.value); }} onKeyDown={function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }} placeholder="Type a message..." style={{ flex: 1, background: '#1E293B', border: '1px solid #334155', borderRadius: 20, padding: '10px 14px', color: '#F8FAFC', fontSize: 14, outline: 'none', minWidth: 0 }} />
        <button type="button" onClick={function () { setShowEmoji(!showEmoji); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 8, flexShrink: 0 }}><FiSmile size={20} /></button>
        <button type="submit" disabled={!content.trim()} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: content.trim() ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : '#1E293B', cursor: content.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FiSend size={18} color="white" />
        </button>
      </form>
    </div>
  );
}

var iconBtn = { background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 6 };
var menuStyle = { display: 'flex', alignItems: 'center', width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: '#CBD5E1', fontSize: 13, cursor: 'pointer', borderRadius: 8 };