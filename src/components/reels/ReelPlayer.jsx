import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2, FiVolume2, FiVolumeX } from 'react-icons/fi';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import { formatNumber, timeAgo } from '../../utils/formatters';

export default function ReelPlayer({ reel, isActive }) {
  var videoRef = useRef(null);
  var liked = useState(false)[0];
  var setLiked = useState(false)[1];
  var muted = useState(false)[0];
  var setMuted = useState(false)[1];

  useEffect(function () {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(function () {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);

  var handleLike = function () {
    setLiked(!liked);
  };

  return (
    <div className="relative w-full h-full bg-black snap-center shrink-0">
      <video
        ref={videoRef}
        src={reel.media && reel.media[0] && reel.media[0].url}
        loop
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-end justify-between">
          <div className="flex-1 mr-4">
            <Link to={'/' + (reel.author && reel.author.username)} className="flex items-center gap-2 mb-2">
              <Avatar src={reel.author && reel.author.avatar} alt="" size="sm" className="border-2 border-white" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-white">@{reel.author && reel.author.username}</span>
                  {reel.author && reel.author.isVerified && <VerifiedBadge />}
                </div>
                <span className="text-xs text-white/70">{timeAgo(reel.createdAt)}</span>
              </div>
            </Link>
            <p className="text-sm text-white/90 line-clamp-2">{reel.content}</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button onClick={handleLike} className="flex flex-col items-center">
              <div className={'w-10 h-10 rounded-full flex items-center justify-center ' + (liked ? 'bg-red-500' : 'bg-white/20')}>
                <FiHeart size={20} className={liked ? 'text-white fill-white' : 'text-white'} />
              </div>
              <span className="text-xs text-white mt-1">{formatNumber((reel.likesCount || 0) + (liked ? 1 : 0))}</span>
            </button>

            <button className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FiMessageCircle size={20} className="text-white" />
              </div>
              <span className="text-xs text-white mt-1">{formatNumber(reel.commentsCount || 0)}</span>
            </button>

            <button className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FiShare2 size={20} className="text-white" />
              </div>
              <span className="text-xs text-white mt-1">Share</span>
            </button>

            <button onClick={function () { setMuted(!muted); }} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mt-2">
              {muted ? <FiVolumeX size={20} className="text-white" /> : <FiVolume2 size={20} className="text-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}