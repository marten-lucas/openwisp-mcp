import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import test from 'node:test';
import { parseTarGzPackages, parseUci } from './uciParser';

function makeTarGz(path: string, contents: string): ArrayBuffer {
  const content = new TextEncoder().encode(contents);
  const tar = new Uint8Array(1024 + Math.ceil(content.length / 512) * 512);
  const header = tar.subarray(0, 512);
  header.set(new TextEncoder().encode(path), 0);
  header.set(new TextEncoder().encode('0000644\0'), 100);
  header.set(new TextEncoder().encode('0000000\0'), 108);
  header.set(new TextEncoder().encode('0000000\0'), 116);
  const sizeField = `${content.length.toString(8).padStart(11, '0')}\0`;
  header.set(new TextEncoder().encode(sizeField), 124);
  header.set(new TextEncoder().encode('00000000000\0'), 136);
  header[156] = '0'.charCodeAt(0);
  header.set(new TextEncoder().encode('ustar\0'), 257);
  header.set(new TextEncoder().encode('00'), 263);

  let checksum = 0;
  for (let i = 0; i < header.length; i++) checksum += i >= 148 && i < 156 ? 0x20 : header[i];
  const checksumField = `${checksum.toString(8).padStart(6, '0')}\0 `;
  header.set(new TextEncoder().encode(checksumField), 148);
  tar.set(content, 512);

  const compressed = gzipSync(tar);
  const result = new ArrayBuffer(compressed.byteLength);
  new Uint8Array(result).set(compressed);
  return result;
}

test('parseUci preserves options and repeated list entries', () => {
  assert.deepEqual(parseUci("config interface 'lan'\n option proto 'static'\n list dns '1.1.1.1'\n list dns '8.8.8.8'\n"), {
    interface: { lan: { proto: 'static', dns: ['1.1.1.1', '8.8.8.8'] } },
  });
});

test('parseTarGzPackages reads the decompressed tar entry payload', () => {
  const packages = parseTarGzPackages(makeTarGz(
    'etc/config/network',
    "config interface 'lan'\n option proto 'static'\n list dns '1.1.1.1'\n",
  ));

  assert.equal(packages.length, 1);
  assert.equal(packages[0].package, 'network');
  assert.equal(packages[0].raw, "config interface 'lan'\n option proto 'static'\n list dns '1.1.1.1'\n");
  assert.deepEqual(packages[0].config, {
    interface: { lan: { proto: 'static', dns: ['1.1.1.1'] } },
  });
});
