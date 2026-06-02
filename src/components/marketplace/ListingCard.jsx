import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { formatNumber, timeAgo } from '../../utils/formatters';

export default function ListingCard({ item }) {
  return (
    <Link to={'/marketplace/' + item._id} className="block bg-vibe-dark rounded-xl border border-vibe-gray-light overflow-hidden hover:border-vibe-gray-light/80 transition group">
      <div className="aspect-square bg-vibe-gray relative overflow-hidden">
        {item.images && item.images[0] ? (
          <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
        )}
        {item.isFree && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">FREE</div>
        )}
        <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
          <FiHeart size={16} />
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{item.title}</h3>
        <div className="text-vibe-blue font-bold text-sm mt-1">
          {item.isFree ? 'FREE' : (item.currency || 'KSh') + ' ' + (item.price ? item.price.toLocaleString() : '0')}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-vibe-text-muted">
          <span>{item.location && item.location.name}</span>
          <span>{timeAgo(item.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}