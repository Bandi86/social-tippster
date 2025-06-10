import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class FileUtils {
  static async getFileStats(filePath: string) {
    try {
      const stats = await fs.promises.stat(filePath);
      return {
        size: stats.size,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        lastModified: stats.mtime,
        created: stats.birthtime,
      };
    } catch (error) {
      throw new Error(`Failed to get file stats: ${error.message}`);
    }
  }

  static async listDirectory(dirPath: string, recursive = false) {
    try {
      const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
      const result = [];

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const stats = await this.getFileStats(fullPath);

        result.push({
          name: item.name,
          path: fullPath,
          type: item.isDirectory() ? 'directory' : 'file',
          ...stats,
        });

        if (recursive && item.isDirectory()) {
          const subItems = await this.listDirectory(fullPath, true);
          result.push(...subItems);
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to list directory: ${error.message}`);
    }
  }

  static async countLines(filePath: string): Promise<number> {
    try {
      if (!(await this.getFileStats(filePath)).isFile) {
        return 0;
      }

      const content = await fs.promises.readFile(filePath, 'utf-8');
      return content.split('\n').length;
    } catch (error) {
      return 0;
    }
  }
}

export class GitUtils {
  static async getCurrentBranch(repoPath: string): Promise<string> {
    try {
      const { stdout } = await execAsync('git branch --show-current', { cwd: repoPath });
      return stdout.trim();
    } catch (error) {
      return 'unknown';
    }
  }

  static async getLastCommit(repoPath: string): Promise<string> {
    try {
      const { stdout } = await execAsync('git log -1 --pretty=format:"%h %s"', { cwd: repoPath });
      return stdout.trim();
    } catch (error) {
      return 'No commits';
    }
  }

  static async getUncommittedChanges(repoPath: string): Promise<number> {
    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: repoPath });
      return stdout.split('\n').filter(line => line.trim()).length;
    } catch (error) {
      return 0;
    }
  }
}

export class ProcessUtils {
  static async checkPortInUse(port: number): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`netstat -an | findstr :${port}`);
      return stdout.includes('LISTENING');
    } catch (error) {
      return false;
    }
  }

  static async getProcessByPort(port: number): Promise<string | null> {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
      if (lines.length > 0) {
        const pid = lines[0].trim().split(/\s+/).pop();
        const { stdout: processInfo } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
        return processInfo.split(',')[0].replace(/"/g, '');
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
