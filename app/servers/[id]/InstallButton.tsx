'use client';

import { ServerVersion } from '@/lib/types';

interface InstallButtonProps {
  slug: string;
  version: ServerVersion;
}

export default function InstallButton({ slug, version }: InstallButtonProps) {
  let config: any;
  
  switch (version.runtime.type) {
    case 'http':
      config = {
        name: slug,
        url: version.runtime.url,
        headers: version.runtime.headers || {}
      };
      break;
    case 'docker':
      config = {
        name: slug,
        type: 'docker',
        image: version.runtime.image,
        ports: version.runtime.ports || {},
        volumes: version.runtime.volumes || [],
        env: version.runtime.env || {}
      };
      break;
    case 'pip':
      config = {
        name: slug,
        type: 'pip',
        package: version.runtime.package,
        module: version.runtime.module,
        env: version.runtime.env || {}
      };
      break;
    case 'node':
    case 'python':
    case 'binary':
    default:
      config = {
        name: slug,
        command: version.runtime.command,
        args: version.runtime.args || [],
        env: version.runtime.env || {}
      };
      break;
  }

  const installUrl = `vscode:mcp/install?${encodeURIComponent(JSON.stringify(config))}`;

  return (
    <a
      href={installUrl}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 no-underline"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Install in VS Code
    </a>
  );
}
