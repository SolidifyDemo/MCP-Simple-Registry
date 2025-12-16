#!/usr/bin/env node
/**
 * Test script for registry fetching functionality
 * Run with: node test-registry-fetcher.mjs
 */

import { 
  fetchNpmPackage, 
  fetchNpmDownloads,
  fetchDockerImage,
  fetchGitHubStars,
  fetchGitHubRepoInfo 
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

console.log('\n🔍 Testing GitHub repo info fetch...');
try {
  const repoInfo = await fetchGitHubRepoInfo('https://github.com/github/github-mcp-server');
  if (repoInfo) {
    console.log('✅ GitHub repo info fetch successful');
    console.log(`   Description: ${repoInfo.description?.substring(0, 60)}...`);
    console.log(`   Stars: ${repoInfo.stars?.toLocaleString()}`);
    console.log(`   License: ${repoInfo.license || 'N/A'}`);
    console.log(`   Homepage: ${repoInfo.homepage || 'N/A'}`);
    console.log(`   Owner Avatar: ${repoInfo.ownerAvatarUrl?.substring(0, 50)}...`);
  } else {
    console.log('❌ GitHub repo info fetch failed');
  }
} catch (error) {
  console.log('❌ GitHub repo info fetch error:', error.message);
}

console.log('\n✨ Test complete!');
