#!/usr/bin/env node

/**
 * Validate MCP Server JSON files
 * Usage: node scripts/validate-server.js <path-to-json>
 */

const fs = require('fs');
const path = require('path');

function validateServer(filePath) {
  console.log(`\n🔍 Validating: ${filePath}`);
  
  // Read and parse JSON
  let serverJson;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    serverJson = JSON.parse(content);
  } catch (error) {
    console.error(`❌ JSON parse error: ${error.message}`);
    return false;
  }

  const errors = [];
  const warnings = [];

  // Required fields
  if (!serverJson.id) {
    errors.push('Missing required field: id');
  } else if (!/^[a-z0-9-]+$/.test(serverJson.id)) {
    errors.push('id must be lowercase alphanumeric with hyphens only');
  }

  if (!serverJson.vendorId) {
    errors.push('Missing required field: vendorId');
  } else if (!/^[a-z0-9-]+$/.test(serverJson.vendorId)) {
    errors.push('vendorId must be lowercase alphanumeric with hyphens only');
  }

  if (!serverJson.slug) {
    errors.push('Missing required field: slug');
  }

  // Metadata validation
  if (!serverJson.metadata) {
    errors.push('Missing required field: metadata');
  } else {
    if (!serverJson.metadata.name) {
      errors.push('Missing required field: metadata.name');
    }
    if (!serverJson.metadata.tags || !Array.isArray(serverJson.metadata.tags) || serverJson.metadata.tags.length === 0) {
      errors.push('metadata.tags must be a non-empty array');
    }
  }

  // Versions validation
  if (!serverJson.versions || !Array.isArray(serverJson.versions) || serverJson.versions.length === 0) {
    errors.push('versions must be a non-empty array');
  } else {
    serverJson.versions.forEach((version, index) => {
      if (!version.runtime) {
        errors.push(`versions[${index}]: Missing required field: runtime`);
      } else {
        const runtime = version.runtime;
        
        if (!runtime.type) {
          errors.push(`versions[${index}].runtime: Missing required field: type`);
        } else if (!['node', 'docker', 'python', 'http', 'stdio'].includes(runtime.type)) {
          warnings.push(`versions[${index}].runtime.type: Unknown type "${runtime.type}"`);
        }

        // Node.js runtime validation
        if (runtime.type === 'node') {
          if (!runtime.command) {
            warnings.push(`versions[${index}].runtime: Node.js runtime should have command field`);
          }
          if (!runtime.args || !Array.isArray(runtime.args)) {
            warnings.push(`versions[${index}].runtime: Node.js runtime should have args array`);
          } else {
            // Check if package name is in args
            const hasPackage = runtime.args.some(arg => arg.startsWith('@') || (!arg.startsWith('-') && arg !== 'npx'));
            if (!hasPackage) {
              warnings.push(`versions[${index}].runtime: Cannot detect package name in args`);
            }
          }
        }

        // Docker runtime validation
        if (runtime.type === 'docker') {
          if (!runtime.image) {
            errors.push(`versions[${index}].runtime: Docker runtime requires image field`);
          }
        }

        // HTTP runtime validation
        if (runtime.type === 'http') {
          if (!runtime.url) {
            errors.push(`versions[${index}].runtime: HTTP runtime requires url field`);
          } else {
            // Validate URL format
            try {
              new URL(runtime.url);
            } catch {
              errors.push(`versions[${index}].runtime.url: Invalid URL format`);
            }
          }
          
          // Validate headers if provided
          if (runtime.headers) {
            if (typeof runtime.headers !== 'object') {
              errors.push(`versions[${index}].runtime.headers must be an object`);
            }
          }
        }

        // Environment variables validation
        if (runtime.env) {
          if (typeof runtime.env !== 'object') {
            errors.push(`versions[${index}].runtime.env must be an object`);
          }
        }
      }
    });
  }

  // Optional field warnings
  if (!serverJson.metadata?.description) {
    warnings.push('No description provided (will be auto-fetched from registry)');
  }

  if (!serverJson.metadata?.homepage) {
    warnings.push('No homepage provided (will be auto-fetched from registry)');
  }

  // File naming convention
  const expectedFileName = `${serverJson.id}.json`;
  const actualFileName = path.basename(filePath);
  if (actualFileName !== expectedFileName) {
    warnings.push(`File name "${actualFileName}" should match server ID: "${expectedFileName}"`);
  }

  // Print results
  if (errors.length > 0) {
    console.error('\n❌ Validation failed:');
    errors.forEach(error => console.error(`  • ${error}`));
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    warnings.forEach(warning => console.warn(`  • ${warning}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Validation passed - no errors or warnings');
    return true;
  } else if (errors.length === 0) {
    console.log('\n✅ Validation passed with warnings');
    return true;
  } else {
    console.error('\n❌ Validation failed');
    return false;
  }
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node validate-server.js <path-to-json>');
  console.error('   or: node validate-server.js --all (validate all servers)');
  process.exit(1);
}

if (args[0] === '--all') {
  // Validate all servers in data/servers/
  const serversDir = path.join(process.cwd(), 'data', 'servers');
  const files = fs.readdirSync(serversDir).filter(f => f.endsWith('.json') && !f.startsWith('.'));
  
  console.log(`\n📋 Validating ${files.length} server(s)...\n`);
  
  let passCount = 0;
  let failCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(serversDir, file);
    const passed = validateServer(filePath);
    if (passed) {
      passCount++;
    } else {
      failCount++;
    }
  });
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Results: ${passCount} passed, ${failCount} failed`);
  console.log('='.repeat(60));
  
  process.exit(failCount > 0 ? 1 : 0);
} else {
  // Validate single file
  const filePath = path.resolve(args[0]);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  const passed = validateServer(filePath);
  process.exit(passed ? 0 : 1);
}
