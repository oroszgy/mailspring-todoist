#!/usr/bin/env node
/**
 * A minimal zip writer.
 *
 * The plugin is distributed as a zip, and the maintainer's machine is not
 * guaranteed to have a `zip` command - so the archive is written here, with
 * nothing but node's own zlib.
 *
 * Only what a plugin release needs: stored directories and deflated files,
 * with the fixed DOS timestamps that keep the archive reproducible.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

/** The DOS time and date pair. 1980-01-01, the earliest a zip can hold. */
const DOS_TIME = 0;
const DOS_DATE = 33;

function localHeader(name, crc, compressedSize, size) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4); // version needed
  header.writeUInt16LE(0, 6); // flags
  header.writeUInt16LE(8, 8); // deflate
  header.writeUInt16LE(DOS_TIME, 10);
  header.writeUInt16LE(DOS_DATE, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(compressedSize, 18);
  header.writeUInt32LE(size, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return header;
}

function centralHeader(name, crc, compressedSize, size, offset) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4); // version made by
  header.writeUInt16LE(20, 6); // version needed
  header.writeUInt16LE(0, 8); // flags
  header.writeUInt16LE(8, 10); // deflate
  header.writeUInt16LE(DOS_TIME, 12);
  header.writeUInt16LE(DOS_DATE, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(compressedSize, 20);
  header.writeUInt32LE(size, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30); // extra
  header.writeUInt16LE(0, 32); // comment
  header.writeUInt16LE(0, 34); // disk
  header.writeUInt16LE(0, 36); // internal attributes
  header.writeUInt32LE(0o644 << 16, 38); // external attributes
  header.writeUInt32LE(offset, 42);
  return header;
}

/**
 * Write a zip.
 *
 * `entries` is a list of `{ name, data }`, where `name` is the path inside
 * the archive and `data` is a Buffer or a string. A name ending in `/` is
 * written as a directory.
 */
function writeZip(entries, outPath) {
  const chunks = [];
  const central = [];
  let offset = 0;
  let count = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const isDirectory = entry.name.endsWith('/');
    const data = isDirectory ? Buffer.alloc(0) : Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data);
    const compressed = isDirectory ? data : zlib.deflateRawSync(data, { level: 9 });
    const crc = crc32(data);

    const local = localHeader(name, crc, compressed.length, data.length);
    chunks.push(local, name, compressed);

    // The central directory holds the header and the name.
    central.push(centralHeader(name, crc, compressed.length, data.length, offset), name);
    count += 1;

    offset += local.length + name.length + compressed.length;
  }

  const centralBuffer = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(count, 8);
  end.writeUInt16LE(count, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, Buffer.concat([...chunks, centralBuffer, end]));

  return outPath;
}

module.exports = { writeZip };
