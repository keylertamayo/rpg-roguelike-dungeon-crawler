import { getUncachableGitHubClient } from '../server/githubClient.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const REPO_OWNER = 'keylertamayo';
const REPO_NAME = 'rpg-roguelike-dungeon-crawler';

// Files and directories to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  '.git',
  'server/public',
  '.env',
  '.env.local',
  '.env.production',
  'scripts/push-to-github.ts', // Don't include this script itself
  '.replit',
  'replit.nix'
];

interface FileEntry {
  path: string;
  content: string;
  encoding: 'utf-8' | 'base64';
}

async function getAllFiles(dir: string, relativePath = ''): Promise<FileEntry[]> {
  const files: FileEntry[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativeFilePath = path.join(relativePath, entry.name).replace(/\\/g, '/');

    // Skip excluded patterns
    if (EXCLUDE_PATTERNS.some(pattern => 
      relativeFilePath.startsWith(pattern) || 
      entry.name.startsWith('.') && entry.name !== '.gitignore'
    )) {
      continue;
    }

    if (entry.isDirectory()) {
      const subFiles = await getAllFiles(fullPath, relativeFilePath);
      files.push(...subFiles);
    } else {
      // Determine if file is binary
      const ext = path.extname(entry.name).toLowerCase();
      const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.mp3', '.wav', '.ogg', '.gltf', '.glb', '.bin'];
      const isBinary = binaryExtensions.includes(ext);

      try {
        const content = await fs.readFile(fullPath, isBinary ? 'base64' : 'utf-8');
        files.push({
          path: relativeFilePath,
          content: content as string,
          encoding: isBinary ? 'base64' : 'utf-8'
        });
      } catch (error) {
        console.warn(`⚠️  Skipping file ${relativeFilePath}: ${error.message}`);
      }
    }
  }

  return files;
}

async function pushToGitHub(): Promise<void> {
  try {
    console.log('🔐 Authenticating with GitHub...');
    const octokit = await getUncachableGitHubClient();
    
    console.log('📁 Collecting project files...');
    const files = await getAllFiles('.');
    console.log(`📊 Found ${files.length} files to commit`);

    // Create blobs for all files
    console.log('📤 Creating blobs...');
    const blobs: Array<{ path: string; sha: string; mode: string }> = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      process.stdout.write(`\r📤 Creating blob ${i + 1}/${files.length}: ${file.path}`);
      
      const { data: blob } = await octokit.rest.git.createBlob({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        content: file.content,
        encoding: file.encoding
      });

      blobs.push({
        path: file.path,
        sha: blob.sha,
        mode: '100644'
      });
    }
    console.log('\n✅ All blobs created');

    // Create tree
    console.log('🌳 Creating tree...');
    const { data: tree } = await octokit.rest.git.createTree({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      tree: blobs.map(blob => ({
        path: blob.path,
        mode: blob.mode as any,
        type: 'blob' as const,
        sha: blob.sha
      }))
    });

    // Check if main branch exists
    let parentSha: string | undefined;
    try {
      const { data: ref } = await octokit.rest.git.getRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: 'heads/main'
      });
      parentSha = ref.object.sha;
      console.log('📝 Found existing main branch, creating update commit...');
    } catch (error) {
      console.log('🆕 No main branch found, creating initial commit...');
    }

    // Create commit
    console.log('💾 Creating commit...');
    const { data: commit } = await octokit.rest.git.createCommit({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      message: 'RPG Roguelike Dungeon Crawler - MVP completo\n\n✨ Características implementadas:\n- Generación procedural de mazmorras\n- Sistema de combate por turnos\n- Progresión de personaje\n- Sistema de inventario y equipamiento\n- Gráficos 3D con Three.js\n- Efectos de sonido y música\n- Controles WASD, I (inventario), X (atacar), E (interactuar)',
      tree: tree.sha,
      parents: parentSha ? [parentSha] : []
    });

    // Update/create reference
    if (parentSha) {
      await octokit.rest.git.updateRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: 'heads/main',
        sha: commit.sha
      });
    } else {
      await octokit.rest.git.createRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: 'refs/heads/main',
        sha: commit.sha
      });
    }

    console.log('\n🎉 ¡Código subido exitosamente a GitHub!');
    console.log(`📦 Repositorio: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
    console.log(`💾 Commit SHA: ${commit.sha}`);
    console.log(`📊 Archivos commiteados: ${files.length}`);

  } catch (error) {
    console.error('❌ Error al subir código:', error.message);
    if (error.response?.data) {
      console.error('📄 Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the script
pushToGitHub().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});