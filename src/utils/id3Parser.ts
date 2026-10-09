/**
 * Lightweight, robust pure TypeScript ID3v2 tag and embedded album art parser.
 * Extracts title, artist, album, genre, year, and APIC cover art without external dependencies.
 */

export interface ParsedAudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  trackNumber?: number;
  pictureUrl?: string;
}

export async function parseAudioFile(file: File): Promise<ParsedAudioMetadata> {
  const metadata: ParsedAudioMetadata = {};

  try {
    // Read first 256KB which usually contains the complete ID3v2 header and APIC picture
    const sliceSize = Math.min(file.size, 512 * 1024);
    const buffer = await file.slice(0, sliceSize).arrayBuffer();
    const view = new DataView(buffer);

    // Check ID3 identifier
    if (
      buffer.byteLength >= 10 &&
      view.getUint8(0) === 0x49 && // 'I'
      view.getUint8(1) === 0x44 && // 'D'
      view.getUint8(2) === 0x33    // '3'
    ) {
      const version = view.getUint8(3); // 3 for ID3v2.3, 4 for ID3v2.4
      const tagSize = decodeSynchsafe(
        view.getUint8(6),
        view.getUint8(7),
        view.getUint8(8),
        view.getUint8(9)
      );

      let offset = 10;
      const endOffset = Math.min(buffer.byteLength, 10 + tagSize);

      while (offset < endOffset - 10) {
        // Read 4-character frame ID
        const frameId = String.fromCharCode(
          view.getUint8(offset),
          view.getUint8(offset + 1),
          view.getUint8(offset + 2),
          view.getUint8(offset + 3)
        );

        if (!/^[A-Z0-9]{4}$/.test(frameId)) {
          break; // end of frames or padding
        }

        let frameSize = 0;
        if (version === 4) {
          frameSize = decodeSynchsafe(
            view.getUint8(offset + 4),
            view.getUint8(offset + 5),
            view.getUint8(offset + 6),
            view.getUint8(offset + 7)
          );
        } else {
          frameSize = view.getUint32(offset + 4, false);
        }

        offset += 10; // skip header
        if (frameSize <= 0 || offset + frameSize > buffer.byteLength) {
          break;
        }

        const frameData = new Uint8Array(buffer, offset, frameSize);

        if (frameId === 'TIT2') {
          metadata.title = decodeTextFrame(frameData);
        } else if (frameId === 'TPE1') {
          metadata.artist = decodeTextFrame(frameData);
        } else if (frameId === 'TALB') {
          metadata.album = decodeTextFrame(frameData);
        } else if (frameId === 'TYER' || frameId === 'TDRC') {
          const rawYear = decodeTextFrame(frameData);
          const parsed = parseInt(rawYear, 10);
          if (!isNaN(parsed)) metadata.year = parsed;
        } else if (frameId === 'TCON') {
          metadata.genre = decodeTextFrame(frameData);
        } else if (frameId === 'TRCK') {
          const rawTrack = decodeTextFrame(frameData);
          const parsed = parseInt(rawTrack.split('/')[0], 10);
          if (!isNaN(parsed)) metadata.trackNumber = parsed;
        } else if (frameId === 'APIC') {
          try {
            metadata.pictureUrl = extractApicPicture(frameData);
          } catch {
            // ignore picture extraction errors
          }
        }

        offset += frameSize;
      }
    }
  } catch (err) {
    console.warn('ID3 tag reading skipped:', err);
  }

  // Fallbacks based on file name if title or artist is empty
  if (!metadata.title) {
    const rawName = file.name.replace(/\.[^/.]+$/, '');
    if (rawName.includes(' - ')) {
      const parts = rawName.split(' - ');
      metadata.artist = parts[0].trim();
      metadata.title = parts.slice(1).join(' - ').trim();
    } else {
      metadata.title = rawName;
    }
  }

  if (!metadata.artist) {
    metadata.artist = 'Unknown Artist';
  }

  if (!metadata.album) {
    metadata.album = 'Local Import';
  }

  return metadata;
}

function decodeSynchsafe(b0: number, b1: number, b2: number, b3: number): number {
  return ((b0 & 0x7f) << 21) | ((b1 & 0x7f) << 14) | ((b2 & 0x7f) << 7) | (b3 & 0x7f);
}

function decodeTextFrame(bytes: Uint8Array): string {
  if (bytes.length <= 1) return '';
  const encoding = bytes[0];
  const textBytes = bytes.subarray(1);

  if (encoding === 0 || encoding === 3) {
    // ISO-8859-1 or UTF-8
    const decoder = new TextDecoder(encoding === 3 ? 'utf-8' : 'iso-8859-1');
    return decoder.decode(textBytes).replace(/\0+$/, '').trim();
  } else if (encoding === 1 || encoding === 2) {
    // UTF-16 with BOM or UTF-16BE
    const decoder = new TextDecoder('utf-16');
    return decoder.decode(textBytes).replace(/\0+$/, '').trim();
  }
  return new TextDecoder().decode(textBytes).replace(/\0+$/, '').trim();
}

function extractApicPicture(bytes: Uint8Array): string | undefined {
  if (bytes.length < 10) return undefined;
  let offset = 1; // skip encoding byte

  // Read MIME type (null-terminated ISO-8859-1 string)
  let mimeEnd = offset;
  while (mimeEnd < bytes.length && bytes[mimeEnd] !== 0) {
    mimeEnd++;
  }
  const mimeType = new TextDecoder('iso-8859-1').decode(bytes.subarray(offset, mimeEnd)) || 'image/jpeg';
  offset = mimeEnd + 1; // skip null byte

  offset++; // skip picture type byte

  // Skip description (null terminated according to encoding)
  while (offset < bytes.length && bytes[offset] !== 0) {
    offset++;
  }
  offset++; // skip null byte
  if (offset < bytes.length && bytes[offset] === 0) offset++; // skip UTF-16 second null byte if present

  // Remainder is picture binary data
  const imageData = bytes.subarray(offset);
  if (imageData.length > 32) {
    const blob = new Blob([imageData as unknown as BlobPart], { type: mimeType });
    return URL.createObjectURL(blob);
  }
  return undefined;
}
