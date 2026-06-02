import { useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { REACTIONS } from '../../utils/constants';

export default function ReactionPicker({ onReaction, currentReaction }) {
  var showState = useState(false);
  var show = showState[0];
  var setShow = showState[1];

  var timerState = useState(null);
  var timer = timerState[0];
  var setTimer = timerState[1];

  var current = REACTIONS.find(function (r) { return r.type === currentReaction; });

  var handleMouseEnter = function () { setTimer(setTimeout(function () { setShow(true); }, 300)); };
  var handleMouseLeave = function () { if (timer) clearTimeout(timer); setTimeout(function () { setShow(false); }, 200); };

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={function () { if (currentReaction) { onReaction(currentReaction); } else { onReaction('like'); } }}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 0', background: 'none', border: 'none', color: current ? '#3B82F6' : '#64748B', cursor: 'pointer', fontSize: 13, width: '100%', justifyContent: 'center' }}
      >
        {current ? <span style={{ fontSize: 18 }}>{current.emoji}</span> : <FiHeart size={18} />}
        <span>{current ? current.label : 'Like'}</span>
      </button>
      {show && (
        <div style={{ position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)', background: '#0F172A', border: '1px solid #1E293B', borderRadius: 20, padding: '6px 12px', display: 'flex', gap: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 20 }}>
          {REACTIONS.map(function (r) { return <button key={r.type} onClick={function () { onReaction(r.type); setShow(false); }} title={r.label} style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', padding: 4, transition: 'transform 0.1s' }}>{r.emoji}</button>; })}
        </div>
      )}
    </div>
  );
}