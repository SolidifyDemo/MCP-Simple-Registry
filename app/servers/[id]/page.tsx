import { getServerById } from '@/lib/data-loader';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import InstallButton from './InstallButton';
import { RuntimeInfo } from '@/lib/types';

// Type helper to check if runtime has a command property
function hasCommand(runtime: RuntimeInfo): runtime is Extract<RuntimeInfo, { command: string }> {
  return 'command' in runtime && typeof runtime.command === 'string';
}

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
  
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

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
  const runtime = latestVersion.runtime;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Registry
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Server Header */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {server.metadata?.name || server.id}
              </h1>
              <p className="text-xl text-gray-850 dark:text-gray-50">
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
              <span className="ml-2 text-gray-850 dark:text-gray-50 font-medium">
                {server.vendorId}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Slug:</span>
              <span className="ml-2 text-gray-850 dark:text-gray-50 font-mono text-sm">
                {server.slug}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">License:</span>
              <span className="ml-2 text-gray-850 dark:text-gray-50">
                {server.metadata?.license || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Latest Version:</span>
              <span className="ml-2 text-gray-850 dark:text-gray-50 font-mono">
                {latestVersion.version}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-850 dark:text-gray-50 mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {server.metadata?.tags?.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag)}`}
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
                  <div className="text-2xl font-bold text-gray-850 dark:text-gray-50">
                    {server.stats.downloads.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
                </div>
              )}
              {server.stats.stars !== undefined && (
                <div>
                  <div className="text-2xl font-bold text-gray-850 dark:text-gray-50">
                    {server.stats.stars.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Stars</div>
                </div>
              )}
              {server.stats.dependents !== undefined && (
                <div>
                  <div className="text-2xl font-bold text-gray-850 dark:text-gray-50">
                    {server.stats.dependents.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Dependents</div>
                </div>
              )}
            </div>
          )}

          {/* Links */}
          {(server.metadata?.homepage || server.metadata?.sourceUrl) && (
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6 justify-center">
              {server.metadata?.homepage && (
                <a
                  href={server.metadata.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Homepage
                </a>
              )}
              {server.metadata?.sourceUrl && (
                <a
                  href={server.metadata.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  Source Code
                </a>
              )}
            </div>
          )}
        </div>

        {/* Installation */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-850 dark:text-gray-50">
              Installation
            </h2>
            <InstallButton slug={server.slug} version={latestVersion} />
          </div>

          {/* Runtime Type Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {(() => {
                if (runtime.type) return runtime.type.toUpperCase();
                if (hasCommand(runtime)) {
                  const cmd = runtime as { command: string; args?: string[]; env?: Record<string, string> };
                  if (cmd.command === 'docker') return 'DOCKER';
                  if (cmd.command === 'npx') return 'NPX';
                  return cmd.command.toUpperCase();
                }
                return 'UNKNOWN';
              })()} Runtime
            </span>
          </div>

          {/* Command/URL Display */}
          <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto mb-4">
            <code className="text-sm text-green-400">
              {(() => {
                if (runtime.type === 'http' && 'url' in runtime) return runtime.url;
                if (runtime.type === 'docker' && 'image' in runtime) return `docker run ${runtime.image}`;
                if (runtime.type === 'pip' && 'package' in runtime) return `pip install ${runtime.package}`;
                if (hasCommand(runtime)) {
                  const cmd = runtime as { command: string; args?: string[]; env?: Record<string, string> };
                  if (cmd.command === 'docker') {
                    return cmd.args ? `docker ${cmd.args.join(' ')}` : 'docker run';
                  }
                  return `${cmd.command} ${cmd.args ? cmd.args.join(' ') : ''}`;
                }
                return 'No command available';
              })()}
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
{(() => {
  let config: Record<string, unknown>;
  if (runtime.type === 'http' && 'url' in runtime) {
    config = {
      url: runtime.url,
      headers: ('headers' in runtime && runtime.headers) || {}
    };
  } else if (runtime.type === 'docker' && 'image' in runtime) {
    config = {
      command: 'docker',
      args: ['run', '-i', '--rm', runtime.image],
      env: ('env' in runtime && runtime.env) || {}
    };
  } else if (runtime.type === 'pip' && 'package' in runtime) {
    config = {
      command: 'python',
      args: ['-m', ('module' in runtime && runtime.module) || runtime.package],
      env: ('env' in runtime && runtime.env) || {}
    };
  } else if (hasCommand(runtime)) {
    const cmd = runtime as { command: string; args?: string[]; env?: Record<string, string> };
    config = {
      command: cmd.command,
      args: cmd.args || [],
      env: cmd.env || {}
    };
  } else {
    config = { command: '', args: [], env: {} };
  }
  return `{
  "mcpServers": {
    "${server.slug}": ${JSON.stringify(config, null, 6).split('\n').join('\n    ')}
  }
}`;
})()}
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
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-lg p-8 mb-6">
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
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-lg p-8">
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
