/**
 * Écriture et lecture minimales d'une archive zip, sans dépendance.
 *
 * Suffit à l'IDML (paquet zip dont le premier fichier, `mimetype`, doit être stocké
 * sans compression) : entrées stockées ou compressées en deflate, noms UTF-8,
 * horodatage fixe pour que deux générations donnent des octets identiques.
 */

const zlib = require('zlib');

const LOCAL_HEADER = 0x04034b50;
const CENTRAL_HEADER = 0x02014b50;
const END_OF_CENTRAL = 0x06054b50;
const UTF8_FLAG = 0x0800;
const METHOD_STORE = 0;
const METHOD_DEFLATE = 8;
const DOS_TIME = 0;
const DOS_DATE = (1 << 5) | 1; // 1980-01-01
const VERSION_NEEDED = 20;

/**
 * @param {{ name: string, data: string|Buffer, store?: boolean }[]} entries dans l'ordre d'écriture
 * @returns {Buffer}
 */
function writeZip(entries) {
  const chunks = [];
  const central = [];
  let offset = 0;

  entries.forEach(({ name, data, store = false }) => {
    const raw = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    const method = store ? METHOD_STORE : METHOD_DEFLATE;
    const body = store ? raw : zlib.deflateRawSync(raw);
    const nameBuffer = Buffer.from(name, 'utf8');
    const crc = zlib.crc32(raw);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(LOCAL_HEADER, 0);
    local.writeUInt16LE(VERSION_NEEDED, 4);
    local.writeUInt16LE(UTF8_FLAG, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, nameBuffer, body);

    const header = Buffer.alloc(46);
    header.writeUInt32LE(CENTRAL_HEADER, 0);
    header.writeUInt16LE(VERSION_NEEDED, 4);
    header.writeUInt16LE(VERSION_NEEDED, 6);
    header.writeUInt16LE(UTF8_FLAG, 8);
    header.writeUInt16LE(method, 10);
    header.writeUInt16LE(DOS_TIME, 12);
    header.writeUInt16LE(DOS_DATE, 14);
    header.writeUInt32LE(crc, 16);
    header.writeUInt32LE(body.length, 20);
    header.writeUInt32LE(raw.length, 24);
    header.writeUInt16LE(nameBuffer.length, 28);
    header.writeUInt32LE(offset, 42);
    central.push(header, nameBuffer);

    offset += local.length + nameBuffer.length + body.length;
  });

  const centralBuffer = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(END_OF_CENTRAL, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, centralBuffer, end]);
}

/**
 * Relit une archive produite par `writeZip` (ou tout zip sans commentaire ni zip64),
 * dans l'ordre des fichiers : sert aux tests.
 * @returns {{ name: string, method: number, data: Buffer }[]}
 */
function readZip(buffer) {
  const endOffset = buffer.length - 22;
  if (endOffset < 0 || buffer.readUInt32LE(endOffset) !== END_OF_CENTRAL) {
    throw new Error('Archive zip invalide : fin de répertoire central introuvable.');
  }
  const count = buffer.readUInt16LE(endOffset + 10);
  let cursor = buffer.readUInt32LE(endOffset + 16);
  const files = [];

  for (let i = 0; i < count; i += 1) {
    if (buffer.readUInt32LE(cursor) !== CENTRAL_HEADER) {
      throw new Error('Archive zip invalide : en-tête de répertoire central attendu.');
    }
    const method = buffer.readUInt16LE(cursor + 10);
    const crc = buffer.readUInt32LE(cursor + 16);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.toString('utf8', cursor + 46, cursor + 46 + nameLength);

    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const body = buffer.subarray(start, start + compressedSize);
    const data = method === METHOD_DEFLATE ? zlib.inflateRawSync(body) : Buffer.from(body);
    if (zlib.crc32(data) !== crc) throw new Error(`Archive zip invalide : somme de contrôle de ${name}.`);

    files.push({ name, method, data });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return files;
}

module.exports = { writeZip, readZip, METHOD_STORE, METHOD_DEFLATE };
