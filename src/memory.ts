import * as os from 'node:os';
import type { MemoryInfo } from './types.js';

export async function getMemoryUsage(): Promise<MemoryInfo | null> {
  try {
    const totalBytes = os.totalmem();
    const freeBytes = os.freemem();
    const usedBytes = totalBytes - freeBytes;
    const percent = (usedBytes / totalBytes) * 100;

    return {
      totalBytes,
      usedBytes,
      freeBytes,
      percent: Math.round(percent),
    };
  } catch {
    return null;
  }
}

export function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) {
    return `${gb.toFixed(1)} GB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}
