export default function ProfileTabs({ activeTab, onTabChange }) {
  var tabs = [
    { key: 'posts', label: 'Posts', icon: '📰' },
    { key: 'reels', label: 'Reels', icon: '🎬' },
    { key: 'saved', label: 'Saved', icon: '🔖' },
    { key: 'listings', label: 'Listings', icon: '🏪' },
  ];

  return (
    <div className="flex border-b border-vibe-gray-light">
      {tabs.map(function (tab) {
        return (
          <button
            key={tab.key}
            onClick={function () { onTabChange(tab.key); }}
            className={'flex-1 flex items-center justify-center gap-1 py-3 text-sm font-medium transition border-b-2 ' + (activeTab === tab.key ? 'border-vibe-blue text-vibe-blue' : 'border-transparent text-vibe-text-muted hover:text-white')}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        );
      })}
    </div>
  );
}