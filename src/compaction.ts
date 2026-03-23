import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

interface CompactionState {
  lastPercent: number | null;
  count: number;
  lastUpdate: number;
}

const STATE_FILE = 'compaction-state.json';
const COMPACTION_THRESHOLD = 10;
const STATE_TTL_MS = 30 * 60 * 1000;

function getStatePath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.claude', 'claude-hud', STATE_FILE);
}

function readState(): CompactionState {
  const statePath = getStatePath();
  try {
    if (fs.existsSync(statePath)) {
      const content = fs.readFileSync(statePath, 'utf-8');
      const state = JSON.parse(content) as CompactionState;
      if (Date.now() - state.lastUpdate < STATE_TTL_MS) {
        return state;
      }
      return { lastPercent: null, count: state.count, lastUpdate: Date.now() };
    }
  } catch {
  }
  return { lastPercent: null, count: 0, lastUpdate: Date.now() };
}

function writeState(state: CompactionState): void {
  const statePath = getStatePath();
  try {
    const dir = path.dirname(statePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(statePath, JSON.stringify(state), 'utf-8');
  } catch {
  }
}

export function detectCompaction(currentPercent: number): number {
  const state = readState();
  
  if (state.lastPercent !== null) {
    const drop = state.lastPercent - currentPercent;
    if (drop >= COMPACTION_THRESHOLD) {
      state.count += 1;
    }
  }
  
  state.lastPercent = currentPercent;
  state.lastUpdate = Date.now();
  writeState(state);
  
  return state.count;
}

export function getCompactionCount(): number {
  const state = readState();
  return state.count;
}

export function resetCompactionCount(): void {
  const statePath = getStatePath();
  try {
    if (fs.existsSync(statePath)) {
      fs.unlinkSync(statePath);
    }
  } catch {
  }
}
