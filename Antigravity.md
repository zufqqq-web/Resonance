# Antigravity Persistent Memory — Resonance

## Project Purpose
Resonance is a desktop music player web application built with React, TypeScript, and Vite. Task 1 implemented real local audio playback using `HTMLAudioElement`, local file importing (MP3, WAV, OGG, FLAC) with drag-and-drop and native file picker, robust playback controls, in-memory library management, duplicate prevention, and error handling while strictly preserving the existing TokyoNight UI design.

## Current State
- Real audio engine fully implemented using `HTMLAudioElement` with rapid track-switch protection, error propagation, seeking, volume/mute control, and auto-advance.
- Local audio importer (`audioImporter.ts`) handles format validation via runtime `canPlayType`, ID3 tag parsing (APIC cover art, title, artist, album), duplicate detection, real duration measurement, and Object URL lifecycle management.
- Existing UI preserved intact with no style, layout, or color modifications.
- Both TypeScript type checking (`tsc --noEmit`) and Vite production build pass with 0 errors.
- Unit and integration tests for audio importing, metadata fallback, duplicate rejection, and audio engine passed with 100% success.

## Architecture
- **Framework**: React 19, TypeScript (strict types, no `any`), Vite.
- **Styling**: Tailwind CSS v4, custom TokyoNight CSS variables and glassmorphism classes (`glass-dock`, `glass-surface`).
- **Audio Engine (`src/services/audioEngine.ts`)**: Singleton managing a single `HTMLAudioElement` instance. Supports play/pause/resume/seek, volume and mute, duration and time synchronization, Web Audio Analyser integration, error events, and load request IDs preventing rapid track switching race conditions.
- **Local Audio Importer (`src/services/audioImporter.ts`)**: Validates supported MIME types and browser playback capabilities; computes durations from audio metadata; parses ID3 tags via `id3Parser.ts`; registers and revokes Object URLs; filters duplicates based on file metadata (`name`, `size`, `lastModified`).
- **Application State (`src/App.tsx`)**: In-memory track collection; derives albums dynamically from imported tracks; manages active track, queue, shuffle, repeat mode ('off', 'all', 'one'), and TokyoNight toast alerts.

## Important Decisions
- **In-Memory Library State**: Tracks imported during a session reside in React state with Object URLs. Explicit notice is displayed that in-memory files reset on refresh.
- **No Simulated/Placeholder Audio**: Replaced default mock/procedural audio with real imported local files per instructions.
- **Clean Object URL Lifecycle**: Active object URLs are tracked in a registry and revoked when tracks are replaced or on `window.beforeunload`.
- **Rapid Track Switching**: Uses incremental load IDs to cancel obsolete `play()` promises, suppressing harmless `AbortError`s and preventing audio race conditions.
- **Graceful Empty State**: Bottom player shows "No track selected" (0:00 / 0:00) with disabled scrubber until tracks are imported and chosen.

## Important Files
- `src/types/music.ts`: Defines `Track`, `TrackFileMetadata`, `Album`, and theme settings.
- `src/services/audioEngine.ts`: Audio engine implementing `HTMLAudioElement` playback and Web Audio frequency analysis.
- `src/services/audioImporter.ts`: Local file import engine, format checker, duplicate detector, and URL lifecycle manager.
- `src/utils/id3Parser.ts`: ID3v2 tag parser extracting metadata and APIC embedded artwork.
- `src/components/BottomPlayer.tsx`: Playback dock with scrubber, play/pause, volume/mute, previous, next, and time readouts.
- `src/components/LibraryView.tsx`: Main library view with drag-and-drop zone, track list, and dynamically derived album carousel.
- `src/components/TrackRow.tsx`: Track row supporting single-click playback/selection and contextual menu actions.
- `src/components/TopBar.tsx`: Top bar with search and native file import button.
- `src/App.tsx`: Main coordinator managing state, keyboard shortcuts, and toast notifications.

## Environment / Setup
- Node.js environment with Vite on port 3000.
- Dependencies installed with `npm install --legacy-peer-deps`.
- Run commands: `npm run lint` (`tsc --noEmit`), `npm run build` (`vite build`), `npm run dev` (`vite`).

## Next Steps
- Future Task 2 / enhancements: Persistent storage / IndexedDB for retaining track metadata or directory handles where permitted, CAVA visualization tuning, and custom playlist persistence.
