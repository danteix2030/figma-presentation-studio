# Feature matrix

DONE requires tests; PARTIAL indicates working subset; BLOCKED external dependency; TODO not implemented. Full requested scope is tracked below, including omissions.

|Feature|Status|Implementation|Tested|Known limitations|
|---|---|---|---|---|
|Research / architecture|PARTIAL|docs/RESEARCH.md; canonical architecture|Official sources read|Cloud details in respective phase|
|Plugin registration / real Figma|DONE|Figma ID 1678935302970085901; registered Desktop directory|Opened in real Figma Design 2026-09-07|Design only; other editors pending|
|Frame detection / selection / sorting / manual ordering|DONE|Top-level frame/component/instance metadata, four sort modes, thumbnail rail, drag reorder, up/down actions and per-slide export toggle|16-slide real deck in Figma; 3 unit tests|—|
|Layer parser / fonts / fills / vectors / fidelity|PARTIAL|Incremental layer parser, text metadata, raster fallback for masks/blur, canonical preview|Real vertical frame parsed and previewed in Figma|Mixed text styles, gradients and some effects use raster fallback|
|Animations entrance / exit / emphasis / triggers|PARTIAL|14 entrance/emphasis effects, timing, easing and trigger metadata; browser preview|Production build and real plugin editor|Exit sequencing and click orchestration pending|
|Custom keyframes / cubic bezier / stagger|TODO|Not implemented|No|Pending|
|Animation copy / bulk / presets / saved templates|TODO|Not implemented|No|Pending|
|Transitions / morph|TODO|Not implemented|No|Pending|
|Timeline drag / duration / zoom / scrub|PARTIAL|Timing bar, numeric delay and duration|Production build|Drag, zoom and scrub pending|
|Preview play / pause / restart / navigation|PARTIAL|Restartable animation preview for the active slide|Real plugin editor|Presentation navigation and pause pending|
|Notes / approval status|DONE|Per-slide speaker notes and four workflow statuses persisted in Figma plugin data|Real plugin editor and build|—|
|Links / media / video settings|PARTIAL|URL/slide destinations plus video URL, autoplay, muted and loop metadata|Real plugin editor and build|Embedded playback and exported interactivity pending|
|Page numbers / charts|TODO|Not implemented|No|Pending|
|Persistence / refresh / undo|PARTIAL|Slide order, layer metadata, slide metadata and explicit Figma refresh|Real plugin editor|Undo history pending|
|Supabase auth / RLS / storage|TODO|Not implemented|No|Pending|
|Web player / fullscreen / scroll|TODO|Not implemented|No|Pending|
|Publishing / slug / password / private / versions|TODO|Not implemented|No|Pending|
|Presenter / timer / laser / overview|TODO|Not implemented|No|Pending|
|QR remote / expiring tokens / realtime|TODO|Not implemented|No|Pending|
|Analytics dashboard / events / privacy|TODO|Not implemented|No|Pending|
|Giphy / Pixabay / independent adapters|TODO|Not implemented|No|Pending|
|PDF / compression / links / password|PARTIAL|Real multi-page PDF generated from Figma frame renders; 3 quality levels|16-slide PDF rendered from real Figma file and native save dialog opened|Links and password pending; visual output is rasterized|
|PNG ZIP export|DONE|Ordered full-frame PNG images packaged with JSZip|Production build and shared export pipeline|Raster output by design|
|PPTX / editable text / masters / Google / Keynote|PARTIAL|Layer-based PPTX: editable text boxes and native simple shapes, separate raster assets, SVG vector assets and speaker notes|One-slide PPTX saved and package inspected: 2 text nodes, 2 native shapes and 13 separate pictures|Complex masks/effects remain raster; masters and Keynote pending|
|Google Slides direct export|PARTIAL|Drive multipart upload converts the editable PPTX to Google Slides and returns the edit link|Build and UI flow verified|Requires a user OAuth access token with `drive.file`; hosted OAuth client pending product credentials|
|PPTX import / Markdown import|TODO|Not implemented|No|Pending|
|Canva export compatibility|TODO|Not implemented|No|Pending|
|Spellcheck Portuguese / English / Spanish|TODO|Not implemented|No|Pending|
|Optional AI analysis / preview apply cancel|TODO|Not implemented|No|Pending|
|Performance 100 slides / virtualization / caching|TODO|Not implemented|No|Pending|
|Observability / export jobs / logs|TODO|Not implemented|No|Pending|
|Private GitHub / CI / Vercel deploy|TODO|Not implemented|No|Pending|
|Seven-slide real Figma acceptance fixture|TODO|Not implemented|No|Pending|
