// frontend/src/utils/deviceFingerprint.ts
export interface ClientFingerprint {
  screen_resolution: string;
  timezone: string;
  language: string;
  hardware_concurrency: number;
  memory?: number;
  color_depth: number;
  pixel_ratio: number;
  canvas_fingerprint?: string;
}

export function collectClientFingerprint(): ClientFingerprint {
  const screen = window.screen;
  const navigator = window.navigator;

  return {
    screen_resolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    hardware_concurrency: navigator.hardwareConcurrency || 0,
    memory: (navigator as any).deviceMemory,
    color_depth: screen.colorDepth,
    pixel_ratio: window.devicePixelRatio,
    canvas_fingerprint: generateCanvasFingerprint(),
  };
}

function generateCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unavailable';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprinting test 🔒', 2, 2);

    return canvas.toDataURL();
  } catch {
    return 'unavailable';
  }
}
