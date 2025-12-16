import { getServerById } from '@/lib/data-loader';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import InstallButton from './InstallButton';

export default async function ServerPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const server = await getServerById(id);

  if (!server) {
    notFound();
  }

  const latestVersion = server.versions[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Registry
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Server Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {server.metadata?.name || server.id}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {server.metadata?.description || 'No description available'}
              </p>
            </div>
            <div className="flex gap-2">
              {server.featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  ⭐ Featured
                </span>
              )}
              {server.verified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Vendor:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium">
                {server.vendorId}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Slug:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-mono text-sm">
                {server.slug}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">License:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {server.metadata?.license || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Latest Version:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-mono">
                {latestVersion.version}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {server.metadata?.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          {server.stats && (
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              {server.stats.downloads !== undefined && (
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {server.stats.downloads.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
                </div>
              )}
              {server.stats.stars !== undefined && (
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {server.stats.stars.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Stars</div>
                </div>
              )}
              {server.stats.dependents !== undefined && (
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {server.stats.dependents.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Dependents</div>
                </div>
              )}
            </div>
          )}

          {/* Links */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            {server.metadata?.homepage && (
              <a
                href={server.metadata.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Homepage →
              </a>
            )}
            {server.metadata?.sourceUrl && (
              <a
                href={server.metadata.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Source Code →
              </a>
            )}
          </div>
        </div>

        {/* Installation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Installation
            </h2>
            <InstallButton slug={server.slug} version={latestVersion} />
          </div>

          {/* Runtime Type Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {latestVersion.runtime.type.toUpperCase()} Runtime
            </span>
          </div>

          {/* Command/URL Display */}
          <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto mb-4">
            <code className="text-sm text-green-400">
              {latestVersion.runtime.type === 'http' && latestVersion.runtime.url}
              {latestVersion.runtime.type === 'docker' && `docker run ${latestVersion.runtime.image}`}
              {latestVersion.runtime.type === 'pip' && `pip install ${latestVersion.runtime.package}`}
              {(latestVersion.runtime.type === 'node' || latestVersion.runtime.type === 'python' || latestVersion.runtime.type === 'binary') && 
                `${latestVersion.runtime.command} ${latestVersion.runtime.args?.join(' ') || ''}`}
            </code>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              VS Code MCP Configuration
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
              Click &ldquo;Install in VS Code&rdquo; button above or add this configuration manually:
            </p>
            <div className="bg-white dark:bg-gray-950 rounded p-3 overflow-x-auto">
              <pre className="text-xs text-gray-800 dark:text-gray-200">
{latestVersion.runtime.type === 'http' ? `{
  "mcpServers": {
    "${server.slug}": ${JSON.stringify({
      url: latestVersion.runtime.url,
      headers: latestVersion.runtime.headers || {}
    }, null, 6).split('\n').join('\n    ')}
  }
}` : latestVersion.runtime.type === 'docker' ? `{
  "mcpServers": {
    "${server.slug}": ${JSON.stringify({
      type: 'docker',
      image: latestVersion.runtime.image,
      ports: latestVersion.runtime.ports || {},
      volumes: latestVersion.runtime.volumes || [],
      env: latestVersion.runtime.env || {}
    }, null, 6).split('\n').join('\n    ')}
  }
}` : latestVersion.runtime.type === 'pip' ? `{
  "mcpServers": {
    "${server.slug}": ${JSON.stringify({
      type: 'pip',
      package: latestVersion.runtime.package,
      module: latestVersion.runtime.module,
      env: latestVersion.runtime.env || {}
    }, null, 6).split('\n').join('\n    ')}
  }
}` : `{
  "mcpServers": {
    "${server.slug}": ${JSON.stringify({
      command: (latestVersion.runtime.type === 'node' || latestVersion.runtime.type === 'python' || latestVersion.runtime.type === 'binary') ? latestVersion.runtime.command : '',
      args: (latestVersion.runtime.type === 'node' || latestVersion.runtime.type === 'python' || latestVersion.runtime.type === 'binary') ? latestVersion.runtime.args || [] : [],
      env: latestVersion.runtime.env || {}
    }, null, 6).split('\n').join('\n    ')}
  }
}`}
              </pre>
            </div>
          </div>
          
          {('env' in latestVersion.runtime) && latestVersion.runtime.env && Object.keys(latestVersion.runtime.env).length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Environment Variables
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                {Object.entries(latestVersion.runtime.env).map(([key, value]) => (
                  <div key={key} className="mb-2 font-mono text-sm">
                    <span className="text-blue-600 dark:text-blue-400">{key}</span>
                    <span className="text-gray-500 dark:text-gray-400">=</span>
                    <span className="text-gray-700 dark:text-gray-300">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {('requirements' in latestVersion.runtime) && latestVersion.runtime.requirements && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Requirements
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                {latestVersion.runtime.requirements.node && (
                  <li>Node.js {latestVersion.runtime.requirements.node}</li>
                )}
                {latestVersion.runtime.requirements.python && (
                  <li>Python {latestVersion.runtime.requirements.python}</li>
                )}
                {latestVersion.runtime.requirements.docker && (
                  <li>Docker {latestVersion.runtime.requirements.docker}</li>
                )}
                {latestVersion.runtime.requirements.os && (
                  <li>OS: {latestVersion.runtime.requirements.os.join(', ')}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Versions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Version History
          </h2>
          <div className="space-y-4">
            {server.versions.map((version, index) => (
              <div 
                key={version.version || `version-${index}`}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {version.version ? `v${version.version}` : 'Latest'}
                  </span>
                  {version.releaseDate && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(version.releaseDate).toLocaleDateString()}
                    </span>
                  )}
                  {version.deprecated && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                      Deprecated
                    </span>
                  )}
                </div>
                {version.changelog && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {version.changelog}
                  </p>
                )}
                {version.mcpVersion && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    MCP Version: {version.mcpVersion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Maintainers */}
        {server.metadata?.maintainers && server.metadata.maintainers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Maintainers
            </h2>
            <div className="space-y-3">
              {server.metadata.maintainers.map((maintainer, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold">
                    {maintainer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {maintainer.name}
                    </div>
                    {maintainer.email && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {maintainer.email}
                      </div>
                    )}
                    {maintainer.url && (
                      <a
                        href={maintainer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {maintainer.url}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
