'use client';

import { Server } from '@/lib/types';

interface ServerCardInstallButtonProps {
  server: Server;
}

export default function ServerCardInstallButton({ server }: ServerCardInstallButtonProps) {
  const latestVersion = server.versions?.[0];

  if (!latestVersion) {
    return null; // No versions available
  }

  let config: Record<string, unknown>;
  
  switch (latestVersion.runtime.type) {
    case 'http':
      config = {
        name: server.slug,
        url: latestVersion.runtime.url,
        headers: latestVersion.runtime.headers || {}
      };
      break;
    case 'docker':
      config = {
        name: server.slug,
        type: 'docker',
        image: latestVersion.runtime.image,
        ports: latestVersion.runtime.ports || {},
        volumes: latestVersion.runtime.volumes || [],
        env: latestVersion.runtime.env || {}
      };
      break;
    case 'pip':
      config = {
        name: server.slug,
        type: 'pip',
        package: latestVersion.runtime.package,
        module: latestVersion.runtime.module,
        env: latestVersion.runtime.env || {}
      };
      break;
    case 'node':
    case 'python':
    case 'binary':
    default:
      config = {
        name: server.slug,
        command: latestVersion.runtime.command,
        args: latestVersion.runtime.args || [],
        env: latestVersion.runtime.env || {}
      };
      break;
  }

  const installUrl = `vscode:mcp/install?${encodeURIComponent(JSON.stringify(config))}`;

  return (
    <a
      href={installUrl}
      onClick={(e) => e.stopPropagation()}
      className="mt-3 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2 no-underline"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Install in VS Code
    </a>
  );
}
