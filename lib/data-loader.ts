import { promises as fs } from 'fs';
import path from 'path';
import { Server } from './types';

let cachedServers: Server[] | null = null;

/**
 * Load servers from individual JSON files in data/servers/ directory
 * Results are cached for performance
 */
export async function loadServers(): Promise<Server[]> {
  if (cachedServers !== null) {
    return cachedServers;
  }

  try {
    const serversDir = path.join(process.cwd(), 'data', 'servers');
    
    // Read all JSON files from the servers directory
    const files = await fs.readdir(serversDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Load each server file
    const servers: Server[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(serversDir, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const server = JSON.parse(fileContent);
      servers.push(server);
    }
    
    cachedServers = servers;
    return servers;
  } catch (error) {
    console.error('Error loading servers:', error);
    throw new Error('Failed to load server data');
  }
}

/**
 * Clear the cache (useful for testing or hot reloading)
 */
export function clearCache(): void {
  cachedServers = null;
}

/**
 * Get a single server by ID
 */
export async function getServerById(id: string): Promise<Server | null> {
  const servers = await loadServers();
  return servers.find(server => server.id === id) || null;
}

/**
 * Search and filter servers
 */
export interface ServerFilter {
  query?: string;
  tags?: string[];
  vendorId?: string;
  featured?: boolean;
  verified?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'downloads' | 'stars' | 'publishedAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedServers {
  servers: Server[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export async function searchServers(filter: ServerFilter = {}): Promise<PaginatedServers> {
  let servers = await loadServers();

  // Apply filters
  if (filter.query) {
    const query = filter.query.toLowerCase();
    servers = servers.filter(server => 
      server.metadata.name.toLowerCase().includes(query) ||
      server.metadata.description.toLowerCase().includes(query) ||
      server.slug.toLowerCase().includes(query) ||
      server.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }

  if (filter.tags && filter.tags.length > 0) {
    servers = servers.filter(server =>
      filter.tags!.some(tag => 
        server.metadata.tags?.includes(tag)
      )
    );
  }

  if (filter.vendorId) {
    servers = servers.filter(server => server.vendorId === filter.vendorId);
  }

  if (filter.featured !== undefined) {
    servers = servers.filter(server => server.featured === filter.featured);
  }

  if (filter.verified !== undefined) {
    servers = servers.filter(server => server.verified === filter.verified);
  }

  // Sorting
  const sortBy = filter.sortBy || 'updatedAt';
  const sortOrder = filter.sortOrder || 'desc';
  
  servers.sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortBy) {
      case 'name':
        aVal = a.metadata.name.toLowerCase();
        bVal = b.metadata.name.toLowerCase();
        break;
      case 'downloads':
        aVal = a.stats?.downloads || 0;
        bVal = b.stats?.downloads || 0;
        break;
      case 'stars':
        aVal = a.stats?.stars || 0;
        bVal = b.stats?.stars || 0;
        break;
      case 'publishedAt':
        aVal = new Date(a.publishedAt).getTime();
        bVal = new Date(b.publishedAt).getTime();
        break;
      case 'updatedAt':
        aVal = new Date(a.updatedAt).getTime();
        bVal = new Date(b.updatedAt).getTime();
        break;
      default:
        aVal = a.updatedAt;
        bVal = b.updatedAt;
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  // Pagination
  const page = Math.max(1, filter.page || 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize || 20));
  const totalItems = servers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedServers = servers.slice(startIndex, endIndex);

  return {
    servers: paginatedServers,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  };
}

/**
 * Get all unique tags from servers
 */
export async function getAllTags(): Promise<string[]> {
  const servers = await loadServers();
  const tagsSet = new Set<string>();
  
  servers.forEach(server => {
    server.metadata.tags?.forEach(tag => tagsSet.add(tag));
  });
  
  return Array.from(tagsSet).sort();
}

/**
 * Get all unique vendor IDs
 */
export async function getAllVendors(): Promise<string[]> {
  const servers = await loadServers();
  const vendorsSet = new Set<string>();
  
  servers.forEach(server => {
    vendorsSet.add(server.vendorId);
  });
  
  return Array.from(vendorsSet).sort();
}

/**
 * Get server statistics
 */
export async function getRegistryStats() {
  const servers = await loadServers();
  
  const totalDownloads = servers.reduce((sum, server) => 
    sum + (server.stats?.downloads || 0), 0
  );
  
  const totalStars = servers.reduce((sum, server) => 
    sum + (server.stats?.stars || 0), 0
  );

  return {
    totalServers: servers.length,
    totalDownloads,
    totalStars,
    featuredServers: servers.filter(s => s.featured).length,
    verifiedServers: servers.filter(s => s.verified).length,
    vendors: (await getAllVendors()).length,
    tags: (await getAllTags()).length
  };
}
