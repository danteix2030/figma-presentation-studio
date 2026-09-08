# QA log

2026-09-07 phase 1: pnpm typecheck, test (3 tests), build passed. Figma Desktop registered ID 1678935302970085901. Plugin opened in real PROPOSTA COMERCIAL file and enumerated 172 eligible top-level nodes. Fixed iframe message reception (Figma wrapper does not preserve parent as source). No document uploads performed.

2026-09-08 export repair: identified that the previous build had no export command. Added on-demand Figma PNG rendering plus PDF, PPTX and standalone HTML exporters. TypeScript, 3 tests and production build passed. Installed the build in the registered Figma development plugin. In the real PROPOSTA COMERCIAL file, selected CENA - 01, parsed its layers, rendered the plugin preview, opened Export, generated PDF, and reached the native save dialog with the expected file name and PDF type. PDF/PPTX currently prioritize visual fidelity through raster slide images; editable PowerPoint elements remain pending.
