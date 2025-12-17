import { searchServers, getAllTags } from '@/lib/data-loader';
import Link from 'next/link';
import ServerCardInstallButton from './ServerCardInstallButton';
import TagList from './TagList';

// Generate consistent colors for tags
function getTagColor(tag: string): string {
  const colors = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
    'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200',
    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
    'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
    'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200',
  ];
  
  // Simple hash function for consistent colors
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default async function Home() {
  const { servers, pagination } = await searchServers({
    pageSize: 50,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });

  const tags = await getAllTags();
  const featuredServers = servers.filter(s => s.featured).slice(0, 6);
  
  // Deduplicate servers by ID to prevent React key conflicts
  const uniqueServers = Array.from(new Map(servers.map(s => [s.id, s])).values());
  const uniqueFeaturedServers = Array.from(new Map(featuredServers.map(s => [s.id, s])).values());

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            MCP Registry
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Discover Model Context Protocol servers
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {uniqueServers.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Servers</div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {uniqueFeaturedServers.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Featured</div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {uniqueServers.filter(s => s.verified).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Verified</div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {tags.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tags</div>
          </div>
        </div>

        {/* Featured Servers */}
        {uniqueFeaturedServers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Servers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueFeaturedServers.map((server) => (
                <div key={`featured-${server.id}`} className="flex flex-col">
                  <Link 
                    href={`/servers/${server.id}`}
                    className="block bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-2 border-blue-500 flex-grow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {server.metadata?.name || server.id}
                      </h3>
                      {server.verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-850 dark:text-gray-50 text-sm mb-4 line-clamp-2">
                      {server.metadata?.description || 'No description available'}
                    </p>
                    <div className="mb-4">
                      <TagList 
                        tags={server.metadata?.tags || []} 
                        serverId={server.id}
                        maxInitial={3}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      {server.versions[0]?.version && (
                        <span>v{server.versions[0].version}</span>
                      )}
                      {server.stats && (
                        <div className="flex gap-3">
                          {server.stats.downloads !== undefined && (
                            <span>↓ {server.stats.downloads.toLocaleString()}</span>
                          )}
                          {server.stats.stars !== undefined && (
                            <span>★ {server.stats.stars.toLocaleString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="px-6 pb-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-b-lg shadow border-x-2 border-b-2 border-blue-500">
                    <ServerCardInstallButton server={server} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Servers */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            All Servers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueServers.map((server) => (
              <div key={`all-${server.id}`} className="flex flex-col">
                <Link 
                  href={`/servers/${server.id}`}
                  className="block bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex-grow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {server.metadata?.name || server.id}
                    </h3>
                    {server.verified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-gray-850 dark:text-gray-50 text-sm mb-4 line-clamp-2">
                    {server.metadata?.description || 'No description available'}
                  </p>
                  <div className="mb-4">
                    <TagList 
                      tags={server.metadata?.tags || []} 
                      serverId={server.id}
                      maxInitial={3}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span className="text-xs">{server.vendorId}</span>
                    {server.stats && (
                      <div className="flex gap-3">
                        {server.stats.downloads !== undefined && (
                          <span>↓ {server.stats.downloads.toLocaleString()}</span>
                        )}
                        {server.stats.stars !== undefined && (
                          <span>★ {server.stats.stars.toLocaleString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="px-6 pb-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-b-lg shadow">
                  <ServerCardInstallButton server={server} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* API Information */}
        <section className="mt-12 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            API Endpoints
          </h2>
          <div className="space-y-2 text-sm font-mono">
            <div className="text-gray-850 dark:text-gray-50">
              <span className="text-green-600 dark:text-green-400">GET</span> /api/v0/servers
            </div>
            <div className="text-gray-850 dark:text-gray-50">
              <span className="text-green-600 dark:text-green-400">GET</span> /api/v0/servers/:id
            </div>
            <div className="text-gray-850 dark:text-gray-50">
              <span className="text-green-600 dark:text-green-400">GET</span> /api/v0/health
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-850 dark:text-gray-50">
          MCP Registry - Model Context Protocol Server Directory
        </div>
      </footer>
    </div>
  );
}
