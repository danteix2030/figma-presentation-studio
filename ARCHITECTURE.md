# Architecture

Figma sandbox → canonical Presentation (Zod/versioned) → shared renderer → plugin preview / web player / export adapters. React UI never accesses Figma directly. Typed request/response bridge with errors and request IDs.

apps/figma-plugin: sandbox commands, parsing and document persistence; bundled UI without external runtime dependencies.
apps/web-player: player and presenter. apps/dashboard and apps/api: authenticated cloud, later phases.
packages/presentation-schema: canonical contract and migrations. packages/figma-parser: traversal and normalized geometry. packages/animation-engine: timing and WAAPI presets. packages/renderer: scene rendering. packages/export-engine: canonical export orchestration. Other packages added with working implementation, not empty feature claims.

Local document data is authoritative for animation/notes/links. No slide upload on open. Images are exported on demand, not stored in pluginData. Per-slide lazy parse, progress and bounded caches. Refresh re-reads geometry and merges metadata by node ID. Undo/redo for editor and Figma commitUndo for changes.

Cloud target: Supabase Auth, Postgres with owner RLS, private storage and signed URLs; Vercel web/API. Public deck versions must be separate from owner-only edit records. Remote sessions use expiring random capabilities scoped to one presentation. All cloud paths require real credentials and integration tests before DONE.

UI: cool slate #202631, panel #2a3240, canvas #151a23, text #edf2f7, muted #a7b3c5, blue #81b5ff. Segoe UI body, Bahnschrift restrained headings, Consolas timing. Signature: timeline doubles as an exact timing ruler, with playhead across all selected layers. Dense editing workbench; no marketing landing page.
