import { gunzipSync } from 'node:zlib';

/**
 * Dependency-free reader for the tar.gz configuration blobs that OpenWISP /
 * netjsonconfig generate (GET /api/v1/controller/device/{id}/configuration/).
 *
 * Tarball layout (netjsonconfig.OpenWrt):
 *   etc/config/firewall
 *   etc/config/network
 *   etc/config/system
 *   ...
 * Each file is a UCI script, e.g.:
 *   config interface 'lan'
 *     option type 'bridge'
 *     option ipaddr '192.168.1.1'
 *     list dns '192.168.1.1'
 *
 * parseUci() converts that into a nested structure of sections:
 * {
 *   interface: { lan: { type: 'bridge', ipaddr: '192.168.1.1', dns: ['192.168.1.1'] } }
 * }
 */

export interface ParsedPackage {
  /** e.g. 'firewall', 'network', 'system' — the file name under etc/config/ */
  package: string;
  /** Raw UCI source as returned by netjsonconfig */
  raw: string;
  /** Parsed UCI, keyed by config type then by section name */
  config: Record<string, UciSection>;
}

export interface UciSection {
  /**
   * Leaf values are strings (option values) or string arrays (list entries).
   * Nested keys point to sub-sections (a section may itself contain sections),
   * which is why the value type is widened to allow arbitrary objects here.
   */
  [key: string]: string | string[] | Record<string, any>;
}

/** Result shape returned to the agent by `openwisp_preview_device_config`. */
export interface PreviewResult {
  deviceId: string;
  /** 'ok' when the tarball was parsed, 'missing' when the endpoint returned nothing/error */
  status: 'ok' | 'missing';
  /** Backend name the config was rendered with (e.g. netjsonconfig.OpenWrt) */
  backend?: string;
  /**
   * When `package` filter is set: only that package (status 'ok' or 'missing').
   * When unset: every parsed package keyed by package name.
   */
  config: Record<string, ParsedPackage> | ParsedPackage;
}

// ---- tar (ustar) parsing ----------------------------------------------------

const TAR_ENTRY_SIZE = 512;
const ASCII_NUL = 0;

interface TarEntry {
  name: string;
  size: number;
  dataStart: number;
}

function parseOctal(raw: Uint8Array, start: number, len: number): number {
  const field = new TextDecoder().decode(raw.subarray(start, start + len));
  const digits = field.replace(/\0.*$/, '').trim();
  if (digits === '') return 0;
  if (!/^[0-7]+$/.test(digits)) throw new Error('Invalid octal value in tar header');
  const value = Number.parseInt(digits, 8);
  if (!Number.isSafeInteger(value)) throw new Error('Tar entry size exceeds the supported range');
  return value;
}

function readTarEntries(view: Uint8Array): TarEntry[] {
  const entries: TarEntry[] = [];
  let offset = 0;

  while (offset + TAR_ENTRY_SIZE <= view.length) {
    // Two consecutive zero blocks terminate the archive.
    let zeros = 0;
    for (let i = 0; i < TAR_ENTRY_SIZE; i++) {
      if (view[offset + i] !== ASCII_NUL) break;
      zeros++;
    }
    if (zeros === TAR_ENTRY_SIZE) break;

    const name = new TextDecoder().decode(view.subarray(offset, offset + 100)).replace(/\0.*$/, '').trim();
    const size = parseOctal(view, offset + 124, 12);
    if (!Number.isSafeInteger(size) || size < 0) {
      throw new Error(`Invalid tar entry size for ${name || '<unnamed>'}`);
    }

    const dataStart = offset + TAR_ENTRY_SIZE;
    const nextEntry = dataStart + Math.ceil(size / TAR_ENTRY_SIZE) * TAR_ENTRY_SIZE;
    if (nextEntry > view.length) {
      throw new Error(`Truncated tar entry: ${name || '<unnamed>'}`);
    }

    if (name) {
      entries.push({ name, size, dataStart });
    }

    offset = nextEntry;
  }

  return entries;
}

// ---- gzip -------------------------------------------------------------------

function gunzip(buffer: ArrayBuffer): Uint8Array {
  return gunzipSync(Buffer.from(buffer));
}

// ---- UCI parsing ------------------------------------------------------------

function parseUciLine(section: UciSection, line: string): boolean {
  const trimmed = line.trim();
  if (trimmed === '' || trimmed.startsWith('#')) return true;

  // config <type> ['name']
  const configMatch = trimmed.match(/^config\s+(\S+)\s*(?:'([^']*)'|"([^"]*)"|(\S+))?/);
  if (configMatch) {
    const type = configMatch[1];
    const name = configMatch[2] ?? configMatch[3] ?? configMatch[4] ?? 'main';
    section[name] ??= {} as UciSection;
    return true;
  }

  // option <key> ['value']
  const optionMatch = trimmed.match(/^option\s+(\S+)\s*(?:'([^']*)'|"([^"]*)"|(.+))?/);
  if (optionMatch) {
    const key = optionMatch[1];
    const value = optionMatch[2] ?? optionMatch[3] ?? optionMatch[4] ?? '';
    (section as Record<string, string | string[]>)[key] = value;
    return true;
  }

  // list <key> ['value']
  const listMatch = trimmed.match(/^list\s+(\S+)\s*(?:'([^']*)'|"([^"]*)"|(.+))?/);
  if (listMatch) {
    const key = listMatch[1];
    const value = listMatch[2] ?? listMatch[3] ?? listMatch[4] ?? '';
    const existing = (section as Record<string, string | string[]>)[key];
    if (Array.isArray(existing)) existing.push(value);
    else section[key] = [value];
    return true;
  }

  return true;
}

export function parseUci(source: string): Record<string, UciSection> {
  const result: Record<string, UciSection> = {};
  let current: UciSection | undefined;

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    const match = trimmed.match(/^config\s+(\S+)\s*(?:'([^']*)'|"([^"]*)"|(\S+))?/);
    if (match) {
      const type = match[1];
      const name = match[2] ?? match[3] ?? match[4] ?? 'main';
      current = {} as UciSection;
      result[type] ??= {};
      result[type][name] = current;
      continue;
    }
    if (current && trimmed !== '' && !trimmed.startsWith('#')) {
      parseUciLine(current, line);
    }
  }

  return result;
}

// ---- top-level API ----------------------------------------------------------

/**
 * Decode a tar.gz buffer into parsed OpenWrt config packages (etc/config/*).
 */
export function parseTarGzPackages(buffer: ArrayBuffer): ParsedPackage[] {
  const tar = gunzip(buffer);
  const entries = readTarEntries(tar);
  const packages: Record<string, string> = {};

  for (const entry of entries) {
    if (!entry.name.startsWith('etc/config/')) continue;
    const pkgName = entry.name.replace(/^etc\/config\//, '');
    if (!pkgName || pkgName.endsWith('.dat')) continue;
    const bytes = tar.subarray(entry.dataStart, entry.dataStart + entry.size);
    packages[pkgName] = new TextDecoder().decode(bytes);
  }

  return Object.entries(packages).map(([packageKey, source]) => ({
    package: packageKey,
    raw: source,
    config: parseUci(source),
  }));
}

/**
 * Download and parse the device configuration tarball into a PreviewResult.
 * `deviceId` is echoed back so the agent knows what was rendered.
 */
export async function fetchAndPreviewDeviceConfig(
  deviceId: string,
  url: string,
  token: string,
  packageFilter?: string
): Promise<PreviewResult> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/gzip',
      Authorization: token.startsWith('Bearer ') || token.startsWith('Token ') ? token : `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      detail = JSON.parse(text).detail || detail;
    } catch {
      // keep text
    }
    throw new Error(`HTTP ${res.status}: ${detail}`);
  }

  const buffer = await res.arrayBuffer();
  const packages = parseTarGzPackages(buffer);

  // Detect backend from any rendered file (netjsonconfig stamps this comment).
  let backend: string | undefined;
  for (const source of packages.map((p) => p.raw)) {
    const m = source.match(/#.*netjsonconfig\.OpenWrt/);
    if (m) {
      backend = m[0].trim().replace(/^.*?netjsonconfig\./, 'netjsonconfig.');
      break;
    }
  }

  if (!packageFilter) {
    const byPackage: Record<string, ParsedPackage> = {};
    for (const pkg of packages) byPackage[pkg.package] = pkg;
    return { deviceId, status: 'ok', backend, config: byPackage };
  }

  const filtered = packages.find((p) => p.package === packageFilter);
  return {
    deviceId,
    status: filtered ? 'ok' : 'missing',
    backend,
    config: filtered ?? { package: packageFilter, raw: '', config: {} },
  };
}
