// filepath: frontend/lib/deviceFingerprint.ts
// ===============================
// Enhanced Device Fingerprinting
// Collects comprehensive device and browser characteristics
// ===============================

export interface ClientFingerprint {
  screen_resolution: string;
  timezone: string;
  language: string;
  hardware_concurrency: number;
  memory?: number;
  color_depth: number;
  pixel_ratio: number;
  canvas_fingerprint?: string;
  // Enhanced fingerprinting
  webgl_fingerprint?: string;
  audio_fingerprint?: string;
  font_fingerprint?: string;
  platform: string;
  user_agent: string;
  touch_support: boolean;
  cookies_enabled: boolean;
  local_storage_enabled: boolean;
  session_storage_enabled: boolean;
  indexed_db_enabled: boolean;
  plugins: string[];
  media_devices: number;
  connection_type?: string;
  webrtc_fingerprint?: string;
  battery_level?: number;
  charging?: boolean;
  do_not_track?: string;
  ad_block_enabled?: boolean;
  fingerprint_hash: string;
}

export async function collectClientFingerprint(): Promise<ClientFingerprint> {
  const screen = window.screen;
  const navigator = window.navigator;

  // Collect basic fingerprint data
  const basicData = {
    screen_resolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    hardware_concurrency: navigator.hardwareConcurrency || 0,
    memory: (navigator as any).deviceMemory,
    color_depth: screen.colorDepth,
    pixel_ratio: window.devicePixelRatio,
    platform: navigator.platform,
    user_agent: navigator.userAgent,
    touch_support: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    cookies_enabled: navigator.cookieEnabled,
    do_not_track:
      navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack,
  };

  // Collect advanced fingerprints
  const [
    canvas_fingerprint,
    webgl_fingerprint,
    audio_fingerprint,
    font_fingerprint,
    local_storage_enabled,
    session_storage_enabled,
    indexed_db_enabled,
    plugins,
    media_devices,
    connection_type,
    webrtc_fingerprint,
    battery_info,
    ad_block_enabled,
  ] = await Promise.all([
    generateCanvasFingerprint(),
    generateWebGLFingerprint(),
    generateAudioFingerprint(),
    generateFontFingerprint(),
    checkLocalStorage(),
    checkSessionStorage(),
    checkIndexedDB(),
    getPluginList(),
    getMediaDeviceCount(),
    getConnectionType(),
    generateWebRTCFingerprint(),
    getBatteryInfo(),
    detectAdBlocker(),
  ]);

  const fingerprint: Omit<ClientFingerprint, 'fingerprint_hash'> = {
    ...basicData,
    canvas_fingerprint,
    webgl_fingerprint,
    audio_fingerprint,
    font_fingerprint,
    local_storage_enabled,
    session_storage_enabled,
    indexed_db_enabled,
    plugins,
    media_devices,
    connection_type,
    webrtc_fingerprint,
    battery_level: battery_info?.level,
    charging: battery_info?.charging,
    ad_block_enabled,
  };

  // Generate hash of all fingerprint data
  const fingerprint_hash = await generateFingerprintHash(fingerprint);

  return {
    ...fingerprint,
    fingerprint_hash,
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

function generateWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    // Type guard: ensure gl is a WebGLRenderingContext
    if (!gl || !(gl instanceof WebGLRenderingContext)) return 'unavailable';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'basic_webgl_support';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}|${renderer}`;
  } catch {
    return 'unavailable';
  }
}

async function generateAudioFingerprint(): Promise<string> {
  try {
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      return 'unavailable';
    }

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();

    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    gainNode.gain.value = 0; // Mute the sound
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(0);

    return new Promise(resolve => {
      scriptProcessor.onaudioprocess = e => {
        const buffer = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += Math.abs(buffer[i]);
        }
        const average = sum / buffer.length;

        oscillator.stop();
        audioContext.close();

        resolve(average.toString());
      };

      // Fallback after 100ms
      setTimeout(() => {
        try {
          oscillator.stop();
          audioContext.close();
        } catch {}
        resolve('timeout');
      }, 100);
    });
  } catch {
    return 'unavailable';
  }
}

function generateFontFingerprint(): string {
  try {
    const testFonts = [
      'Arial',
      'Verdana',
      'Times New Roman',
      'Courier New',
      'Georgia',
      'Palatino',
      'Garamond',
      'Bookman',
      'Comic Sans MS',
      'Trebuchet MS',
      'Arial Black',
      'Impact',
      'Helvetica',
      'Tahoma',
      'Geneva',
    ];

    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 'unavailable';

    const baseMeasurements: Record<string, number> = {};

    // Get baseline measurements
    baseFonts.forEach(baseFont => {
      context.font = `${testSize} ${baseFont}`;
      baseMeasurements[baseFont] = context.measureText(testString).width;
    });

    const detectedFonts: string[] = [];

    // Test each font
    testFonts.forEach(testFont => {
      baseFonts.forEach(baseFont => {
        context.font = `${testSize} ${testFont}, ${baseFont}`;
        const measurement = context.measureText(testString).width;

        if (measurement !== baseMeasurements[baseFont]) {
          if (!detectedFonts.includes(testFont)) {
            detectedFonts.push(testFont);
          }
        }
      });
    });

    return detectedFonts.sort().join(',');
  } catch {
    return 'unavailable';
  }
}

function checkLocalStorage(): boolean {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function checkSessionStorage(): boolean {
  try {
    const test = 'test';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

async function checkIndexedDB(): Promise<boolean> {
  try {
    if (!window.indexedDB) return false;

    return new Promise(resolve => {
      const request = indexedDB.open('test', 1);

      request.onsuccess = () => {
        try {
          request.result.close();
          indexedDB.deleteDatabase('test');
          resolve(true);
        } catch {
          resolve(false);
        }
      };

      request.onerror = () => resolve(false);
      request.onblocked = () => resolve(false);

      setTimeout(() => resolve(false), 1000);
    });
  } catch {
    return false;
  }
}

function getPluginList(): string[] {
  try {
    const plugins = Array.from(navigator.plugins);
    return plugins.map(plugin => plugin.name).sort();
  } catch {
    return [];
  }
}

async function getMediaDeviceCount(): Promise<number> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return 0;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.length;
  } catch {
    return 0;
  }
}

function getConnectionType(): string | undefined {
  try {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      return connection.effectiveType || connection.type || 'unknown';
    }

    return undefined;
  } catch {
    return undefined;
  }
}

async function generateWebRTCFingerprint(): Promise<string> {
  try {
    if (!window.RTCPeerConnection) {
      return 'unavailable';
    }

    const pc = new RTCPeerConnection();

    return new Promise(resolve => {
      pc.createDataChannel('test');

      pc.createOffer()
        .then(offer => {
          const lines = offer.sdp?.split('\n') || [];
          const fingerprints = lines
            .filter(line => line.includes('a=fingerprint:'))
            .map(line => line.split(' ')[1])
            .join(',');

          pc.close();
          resolve(fingerprints || 'no_fingerprint');
        })
        .catch(() => {
          pc.close();
          resolve('error');
        });

      setTimeout(() => {
        pc.close();
        resolve('timeout');
      }, 1000);
    });
  } catch {
    return 'unavailable';
  }
}

async function getBatteryInfo(): Promise<{ level?: number; charging?: boolean } | undefined> {
  try {
    const battery = await (navigator as any).getBattery?.();
    if (battery) {
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
      };
    }
    return undefined;
  } catch {
    return undefined;
  }
}

async function detectAdBlocker(): Promise<boolean> {
  try {
    // Create a fake ad element
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-10000px';

    document.body.appendChild(testAd);

    await new Promise(resolve => setTimeout(resolve, 10));

    const isBlocked = testAd.offsetHeight === 0;
    document.body.removeChild(testAd);

    return isBlocked;
  } catch {
    return false;
  }
}

async function generateFingerprintHash(data: any): Promise<string> {
  try {
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString);

    if (window.crypto && window.crypto.subtle) {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback simple hash for older browsers
      let hash = 0;
      for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(16);
    }
  } catch {
    return 'hash_unavailable';
  }
}

// Utility function for simplified fingerprint (backward compatibility)
export async function getBasicFingerprint(): Promise<Partial<ClientFingerprint>> {
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
    platform: navigator.platform,
    user_agent: navigator.userAgent,
    canvas_fingerprint: generateCanvasFingerprint(),
  };
}

// Export the enhanced collection as default
export default collectClientFingerprint;
