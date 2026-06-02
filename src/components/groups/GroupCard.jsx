import { Link } from 'react-router-dom';
import { FiUsers, FiLock, FiGlobe } from 'react-icons/fi';
import { formatNumber } from '../../utils/formatters';

export default function GroupCard({ group }) {
  return (
    <Link to={'/groups/' + group._id} className="block bg-vibe-dark rounded-xl border border-vibe-gray-light overflow-hidden hover:border-vibe-gray-light/80 transition group">
      <div className="h-24 gradient-bg relative">
        {group.coverPhoto && (
          <img src={group.coverPhoto} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-xl bg-vibe-dark border-4 border-vibe-dark flex items-center justify-center text-2xl font-bold text-white gradient-bg">
          {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
        </div>
      </div>
      <div className="p-4 pt-8">
        <h3 className="font-semibold truncate">{group.name}</h3>
        <p className="text-sm text-vibe-text-muted line-clamp-2 mt-1">{group.description}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-vibe-text-muted">
          <span className="flex items-center gap-1"><FiUsers size={14} /> {formatNumber(group.membersCount)} members</span>
          <span className="flex items-center gap-1">
            {group.privacy === 'public' ? <FiGlobe size={14} /> : <FiLock size={14} />}
            {group.privacy === 'public' ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
    </Link>
  );
}