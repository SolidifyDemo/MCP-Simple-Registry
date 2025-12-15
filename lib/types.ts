// MCP Registry Type Definitions
// Based on the Model Context Protocol registry specification

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
