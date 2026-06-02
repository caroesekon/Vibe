import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMapPin, FiLink, FiCalendar, FiMoreHorizontal } from 'react-icons/fi';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import { formatNumber, formatDate } from '../../utils/formatters';

export default function ProfileHeader({ profile, isOwner, onFollow, onMessage }) {
  var t = useTranslation().t;

  return (
    <div className="bg-vibe-dark rounded-xl border border-vibe-gray-light overflow-hidden">
      <div className="h-40 sm:h-52 gradient-bg relative">
        {profile.coverPhoto && (
          <img src={profile.coverPhoto} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="px-4 sm:px-6 pb-4">
        <div className="flex items-end justify-between -mt-16 mb-4">
          <Avatar src={profile.avatar} alt={profile.firstName} size="xl" className="border-4 border-vibe-dark" />
          <div className="flex items-center gap-2">
            {isOwner ? (
              <Link to="/settings/profile">
                <Button variant="secondary" size="sm">{t('profile.editProfile')}</Button>
              </Link>
            ) : (
              <>
                <Button onClick={onMessage} variant="secondary" size="sm">{t('profile.message')}</Button>
                <Button onClick={onFollow} variant={profile.isFollowing ? 'secondary' : 'primary'} size="sm">
                  {profile.isFollowing ? t('profile.unfollow') : t('profile.follow')}
                </Button>
                <button className="p-2 rounded-lg hover:bg-vibe-gray transition text-vibe-text-muted">
                  <FiMoreHorizontal size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1">
            <h2 className="text-xl font-bold">{profile.firstName} {profile.lastName}</h2>
            {profile.isVerified && <VerifiedBadge size="md" />}
            {profile.isPremium && <span className="text-xs gradient-bg text-white px-2 py-0.5 rounded-full">PRO</span>}
          </div>
          <p className="text-sm text-vibe-text-muted">@{profile.username}</p>

          {profile.bio && <p className="text-sm mt-2 whitespace-pre-wrap">{profile.bio}</p>}

          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-vibe-text-muted">
            {profile.location && (
              <span className="flex items-center gap-1"><FiMapPin size={14} /> {profile.location}</span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-vibe-blue hover:underline">
                <FiLink size={14} /> Website
              </a>
            )}
            <span className="flex items-center gap-1"><FiCalendar size={14} /> Joined {formatDate(profile.createdAt)}</span>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm">
            <Link to={'/' + profile.username + '/following'} className="hover:underline">
              <span className="font-bold">{formatNumber(profile.followingCount)}</span>{' '}
              <span className="text-vibe-text-muted">{t('profile.following')}</span>
            </Link>
            <Link to={'/' + profile.username + '/followers'} className="hover:underline">
              <span className="font-bold">{formatNumber(profile.followersCount)}</span>{' '}
              <span className="text-vibe-text-muted">{t('profile.followers')}</span>
            </Link>
            <span>
              <span className="font-bold">{formatNumber(profile.friendsCount)}</span>{' '}
              <span className="text-vibe-text-muted">{t('profile.friends')}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}