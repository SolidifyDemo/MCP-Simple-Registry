#!/usr/bin/env node
/**
 * Test script for registry fetching functionality
 * Run with: node test-registry-fetcher.mjs
 */

import { 
  fetchNpmPackage, 
  fetchNpmDownloads,
  fetchDockerImage,
  fetchGitHubStars 
} from './lib/registry-fetcher.ts';

console.log('🧪 Testing Registry Fetcher\n');

// Test NPM package fetching
console.log('📦 Testing NPM package fetch...');
try {
  const npmInfo = await fetchNpmPackage('@modelcontextprotocol/server-brave-search');
  if (npmInfo) {
    console.log('✅ NPM fetch successful');
    console.log(`   Package: ${npmInfo.name}`);
    console.log(`   Latest version: ${npmInfo.version}`);
    console.log(`   Description: ${npmInfo.description?.substring(0, 60)}...`);
    
    const downloads = await fetchNpmDownloads(npmInfo.name);
    console.log(`   Downloads (last month): ${downloads.toLocaleString()}`);
  } else {
    console.log('❌ NPM fetch failed');
  }
} catch (error) {
  console.log('❌ NPM fetch error:', error.message);
}

console.log('\n🐳 Testing Docker Hub fetch...');
try {
  const dockerInfo = await fetchDockerImage('nginx');
  if (dockerInfo) {
    console.log('✅ Docker Hub fetch successful');
    console.log(`   Image: ${dockerInfo.image}`);
    console.log(`   Latest version: ${dockerInfo.version}`);
    console.log(`   Pulls: ${dockerInfo.pulls?.toLocaleString()}`);
    console.log(`   Stars: ${dockerInfo.stars}`);
    console.log(`   Tags: ${dockerInfo.tags?.slice(0, 5).join(', ')}...`);
  } else {
    console.log('❌ Docker Hub fetch failed');
  }
} catch (error) {
  console.log('❌ Docker Hub fetch error:', error.message);
}

console.log('\n⭐ Testing GitHub stars fetch...');
try {
  const stars = await fetchGitHubStars('https://github.com/modelcontextprotocol/servers');
  if (stars > 0) {
    console.log('✅ GitHub fetch successful');
    console.log(`   Stars: ${stars.toLocaleString()}`);
  } else {
    console.log('⚠️  No stars found (might need GITHUB_TOKEN)');
  }
} catch (error) {
  console.log('❌ GitHub fetch error:', error.message);
}

console.log('\n✨ Test complete!');
