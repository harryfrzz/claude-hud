import type { RenderContext } from '../../types.js';
import { formatBytes } from '../../memory.js';
import { coloredBar, dim, getContextColor, RESET } from '../colors.js';
import { getAdaptiveBarWidth } from '../../utils/terminal.js';

export function renderMemoryLine(ctx: RenderContext): string | null {
  const display = ctx.config?.display;
  if (display?.showMemoryUsage !== true) {
    return null;
  }

  const memory = ctx.memoryUsage;
  if (!memory) {
    return null;
  }

  const threshold = display?.memoryThreshold ?? 80;
  const colors = ctx.config?.colors;
  const color = memory.percent >= threshold
    ? (colors?.critical ?? '\x1b[31m')
    : getContextColor(memory.percent, colors);

  const barWidth = Math.min(getAdaptiveBarWidth(), 10);
  const bar = coloredBar(memory.percent, barWidth, colors);

  const usedDisplay = formatBytes(memory.usedBytes);
  const totalDisplay = formatBytes(memory.totalBytes);

  return `${dim('RAM')} ${bar} ${color}${usedDisplay} / ${totalDisplay} (${memory.percent}%)${RESET}`;
}
