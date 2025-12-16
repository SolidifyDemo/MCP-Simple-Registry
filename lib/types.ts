// MCP Registry Type Definitions
// Based on the Model Context Protocol registry specification

// Official MCP Server Schema Types
export interface MCPServerSchema {
  $schema: string;
  name: string;
  description: string;
  title?: string;
  websiteUrl?: string;
  version: string;
  repository?: {
    url?: string;
    source?: 'github' | 'gitlab' | string;
  };
  icons?: Icon[];
  remotes?: Remote[];
  packages?: Package[];
  _meta?: Record<string, unknown>;
}

export interface Icon {
  src: string;
  mimeType?: string;
  theme?: 'light' | 'dark';
}

export interface Remote {
  type: 'streamable-http' | 'sse' | 'stdio';
  url?: string;
}

export interface Package {
  registryType: 'npm' | 'pypi' | 'oci' | string;
  registryBaseUrl?: string;
  identifier: string;
  version?: string;
  transport?: {
    type: 'stdio' | 'http' | 'sse';
  };
  [key: string]: unknown; // Allow additional properties like environmentVariables
}

export interface MCPServerEntry {
  server: MCPServerSchema;
  _meta: {
    'io.modelcontextprotocol.registry/official': {
      status: 'active' | 'deprecated' | 'archived';
      publishedAt: string;
      updatedAt: string;
      isLatest: boolean;
    };
  };
}

export interface MCPServersResponse {
  servers: MCPServerEntry[];
  metadata: {
    nextCursor?: string;
    count: number;
  };
}

// Internal Server Metadata (for backwards compatibility)
export interface ServerMetadata {
  name: string;
  description: string;
  homepage?: string;
  license?: string;
  sourceUrl?: string;
  tags?: string[];
  maintainers?: Maintainer[];
  logoUrl?: string;
}

export interface Maintainer {
  name: string;
  email?: string;
  url?: string;
}

export interface ServerVersion {
  version: string;
  releaseDate: string;
  changelog?: string;
  runtime: RuntimeInfo;
  mcpVersion?: string;
  deprecated?: boolean;
  securityAdvisories?: SecurityAdvisory[];
}

export type RuntimeInfo = 
  | {
      type: 'node' | 'binary';
      command: string;
      args?: string[];
      env?: Record<string, string>;
      requirements?: Requirements;
    }
  | {
      type: 'python';
      command: string;
      args?: string[];
      env?: Record<string, string>;
      requirements?: Requirements;
    }
  | {
      type: 'pip';
      package: string;
      module: string;
      env?: Record<string, string>;
      requirements?: Requirements;
    }
  | {
      type: 'docker';
      image: string;
      ports?: Record<string, number>;
      volumes?: string[];
      env?: Record<string, string>;
      requirements?: Requirements;
    }
  | {
      type: 'http';
      url: string;
      headers?: Record<string, string>;
    };

export interface Requirements {
  node?: string;
  python?: string;
  docker?: string;
  os?: string[];
}

export interface SecurityAdvisory {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  publishedAt: string;
  fixedInVersion?: string;
}

export interface Server {
  id: string;
  vendorId: string;
  slug: string;
  metadata: ServerMetadata;
  versions: ServerVersion[];
  stats?: ServerStats;
  publishedAt: string;
  updatedAt: string;
  featured?: boolean;
  verified?: boolean;
}

export interface ServerStats {
  downloads?: number;
  stars?: number;
  dependents?: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ServersResponse {
  servers: Server[];
  pagination: PaginationInfo;
}

export interface ServerDetailResponse {
  server: Server;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  timestamp: string;
  checks: {
    dataSource: 'ok' | 'error';
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: unknown;
}
