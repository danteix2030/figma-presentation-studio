import React, { useEffect, useMemo, useState } from "react";
import {
  sortFrames,
  type FrameInfo,
  type SortMode,
} from "../../../packages/presentation-schema/src";
import {
  defaultLayerMeta,
  flatten,
  type LayerMeta,
  type Motion,
  type Slide,
  type SlideMeta,
} from "../../../packages/presentation-schema/src/model";
import { Scene } from "../../../packages/renderer/src/Scene";
import { request } from "./bridge";
import {
  exportGoogleSlides,
  exportPdf,
  exportPngZip,
  exportPptx,
  exportWeb,
} from "./exporters";

const LOGO = (window as unknown as { __FIGS_DEC_LOGO__: string })
  .__FIGS_DEC_LOGO__;
const readGoogleToken=()=>{try{return sessionStorage.getItem("figs-google-token")||"";}catch{return "";}};
const rememberGoogleToken=(value:string)=>{try{sessionStorage.setItem("figs-google-token",value);}catch{/* Figma pode bloquear storage em iframe local. */}};
type ToolTab = "animations" | "media" | "links";
type ExportKind = "pdf" | "pptx" | "google" | "web" | "png";
const effects: Motion["effect"][] = [
  "fade",
  "fade-up",
  "fade-down",
  "fade-left",
  "fade-right",
  "zoom",
  "pop",
  "rotate",
  "flip",
  "blur",
  "wipe",
  "bounce",
  "pulse",
  "shake",
];

export function Studio() {
  const [frames, setFrames] = useState<FrameInfo[]>([]),
    [checked, setChecked] = useState<string[]>([]),
    [sort, setSort] = useState<SortMode>("visual"),
    [query, setQuery] = useState(""),
    [ids, setIds] = useState<string[]>([]),
    [enabled, setEnabled] = useState<string[]>([]),
    [active, setActive] = useState(""),
    [slide, setSlide] = useState<Slide | null>(null),
    [selected, setSelected] = useState<string[]>([]),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [saved, setSaved] = useState("Local"),
    [title, setTitle] = useState("Presentation"),
    [thumbs, setThumbs] = useState<Record<string, string>>({}),
    [tab, setTab] = useState<ToolTab>("animations"),
    [playToken, setPlayToken] = useState(0),
    [exportOpen, setExportOpen] = useState(false),
    [format, setFormat] = useState<ExportKind>("pdf"),
    [quality, setQuality] = useState(1),
    [googleToken, setGoogleToken] = useState(
      readGoogleToken,
    ),
    [googleLink, setGoogleLink] = useState("");
  async function list() {
    setBusy("Lendo página…");
    try {
      const result = await request<{
        frames: FrameInfo[];
        order: string[];
        title: string;
      }>("list");
      setFrames(result.frames);
      setTitle(result.title);
      setChecked(
        result.order.length
          ? result.order.filter((id) =>
              result.frames.some((frame) => frame.id === id),
            )
          : result.frames.map((frame) => frame.id),
      );
    } catch (cause) {
      setError(String(cause));
    } finally {
      setBusy("");
    }
  }
  useEffect(() => {
    void list();
    const handler = (event: Event) => setBusy((event as CustomEvent).detail);
    window.addEventListener("studio-progress", handler);
    return () => window.removeEventListener("studio-progress", handler);
  }, []);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setBusy("Carregando slide…");
    setSlide(null);
    setSelected([]);
    request<Slide>("parse", { id: active })
      .then((result) => {
        if (!cancelled) setSlide(result);
      })
      .catch((cause) => {
        if (!cancelled) setError(String(cause));
      })
      .finally(() => {
        if (!cancelled) setBusy("");
      });
    return () => {
      cancelled = true;
    };
  }, [active]);
  useEffect(() => {
    if (!ids.length) return;
    let stopped = false;
    (async () => {
      for (const id of ids) {
        if (stopped || thumbs[id]) continue;
        try {
          const result = await request<{ bytes: Uint8Array }>("export-slide", {
            id,
            quality: 0.12,
          });
          const url = URL.createObjectURL(
            new Blob([new Uint8Array(result.bytes).buffer], {
              type: "image/png",
            }),
          );
          if (!stopped) setThumbs((previous) => ({ ...previous, [id]: url }));
        } catch {
          break;
        }
      }
    })();
    return () => {
      stopped = true;
    };
  }, [ids]);
  async function reload() {
    if (!active) return;
    setBusy("Atualizando slide…");
    try {
      setSlide(await request<Slide>("parse", { id: active }));
    } catch (cause) {
      setError(String(cause));
    } finally {
      setBusy("");
    }
  }
  async function saveLayer(meta: LayerMeta) {
    if (!slide) return;
    const targets = flatten(slide.layers).filter((layer) =>
      selected.includes(layer.id),
    );
    targets.forEach((layer) => (layer.meta = { ...meta }));
    setSlide({ ...slide });
    setSaved("Salvando…");
    try {
      for (const layer of targets)
        await request("save-layer", { id: layer.id, meta: layer.meta });
      setSaved("Salvo");
    } catch (cause) {
      setSaved("Erro");
      setError(String(cause));
    }
  }
  async function saveSlide(meta: SlideMeta) {
    if (!slide) return;
    setSlide({ ...slide, meta });
    setSaved("Salvando…");
    try {
      await request("save-slide", { id: slide.id, meta });
      setSaved("Salvo");
    } catch (cause) {
      setSaved("Erro");
      setError(String(cause));
    }
  }
  async function runExport() {
    setError("");
    setGoogleLink("");
    setBusy("Preparando exportação…");
    try {
      if (!enabled.length)
        throw new Error("Ative ao menos um slide para exportar.");
      const progress = (message: string) => setBusy(message);
      if (format === "pdf") await exportPdf(enabled, title, quality, progress);
      if (format === "pptx")
        await exportPptx(enabled, title, quality, progress);
      if (format === "google") {
        rememberGoogleToken(googleToken);
        setGoogleLink(
          await exportGoogleSlides(enabled, title, googleToken, progress),
        );
      }
      if (format === "web") await exportWeb(enabled, title, quality, progress);
      if (format === "png")
        await exportPngZip(enabled, title, quality, progress);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy("");
    }
  }
  const layers = slide ? flatten(slide.layers) : [],
    layer = layers.find((item) => selected.includes(item.id));
  const ordered = sortFrames(frames, sort).filter((frame) =>
    frame.name.toLowerCase().includes(query.toLowerCase()),
  );
  function setMotion(effect: Motion["effect"]) {
    const base = layer?.meta ?? defaultLayerMeta();
    void saveLayer({
      ...base,
      animations: [
        {
          id: crypto.randomUUID(),
          effect,
          trigger: "enter",
          phase: ["pulse", "shake"].includes(effect) ? "emphasis" : "entrance",
          duration: 700,
          delay: 0,
          easing: "cubic-bezier(.2,.8,.2,1)",
          distance: 48,
        },
      ],
    });
  }
  return (
    <main className="studio">
      <TopBar
        saved={saved}
        loaded={!!ids.length}
        onSlides={() => {
          setIds([]);
          setEnabled([]);
          setActive("");
          setSlide(null);
          setExportOpen(false);
        }}
        onExport={() => setExportOpen(true)}
        onRefresh={() => (ids.length ? reload() : list())}
      />
      {error && (
        <div className="notice" role="alert">
          {error}
          <button onClick={() => setError("")}>Fechar</button>
        </div>
      )}
      {busy && (
        <div className="progress" role="status">
          <i />
          {busy}
        </div>
      )}
      {!ids.length ? (
        <section className="welcome">
          <div className="welcome-card">
            <img src={LOGO} />
            <div>
              <small>APRESENTAÇÕES A PARTIR DO FIGMA</small>
              <h1>Escolha os frames que viram slides</h1>
              <p>
                Use a ordem visual, por nome, por layer ou reorganize depois no
                editor.
              </p>
            </div>
          </div>
          <nav>
            <input
              aria-label="Pesquisar slides"
              placeholder="Pesquisar slides…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button onClick={() => setChecked(frames.map((frame) => frame.id))}>
              Selecionar todos
            </button>
            <button onClick={() => setChecked([])}>Desmarcar</button>
            <select
              aria-label="Ordenação"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
            >
              <option value="visual">Posição visual</option>
              <option value="layers">Ordem das layers</option>
              <option value="name">Nome</option>
              <option value="numeric">Numérica</option>
            </select>
          </nav>
          <div className="frame-list">
            {ordered.map((frame, index) => (
              <label className="frame" key={frame.id}>
                <input
                  type="checkbox"
                  checked={checked.includes(frame.id)}
                  onChange={(event) =>
                    setChecked(
                      event.target.checked
                        ? [...checked, frame.id]
                        : checked.filter((id) => id !== frame.id),
                    )
                  }
                />
                <span className="number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{frame.name}</strong>
                <small>
                  {Math.round(frame.width)} × {Math.round(frame.height)}
                </small>
              </label>
            ))}
          </div>
          <footer>
            <span>
              {checked.length} de {frames.length} selecionados
            </span>
            <button
              className="primary"
              disabled={!checked.length || !!busy}
              onClick={() => {
                const order = sortFrames(frames, sort)
                  .filter((frame) => checked.includes(frame.id))
                  .map((frame) => frame.id);
                setIds(order);
                setEnabled(order);
                setActive(order[0]);
                void request("save-order", { ids: order }).catch((cause) =>
                  setError(String(cause)),
                );
              }}
            >
              Carregar slides ({checked.length}) →
            </button>
          </footer>
        </section>
      ) : (
        <div className={"editor " + (exportOpen ? "with-export" : "")}>
          <SlideRail
            ids={ids}
            enabled={enabled}
            active={active}
            frames={frames}
            thumbs={thumbs}
            onActive={setActive}
            onEnabled={setEnabled}
            onRefresh={() => setThumbs({})}
            onOrder={(next) => {
              setIds(next);
              void request("save-order", { ids: next });
            }}
          />
          <section className="stage">
            <div className="stage-title">
              <strong>{slide?.name ?? "Carregando…"}</strong>
              <span>
                {slide &&
                  `${Math.round(slide.width)} × ${Math.round(slide.height)}`}
              </span>
              <button onClick={() => setPlayToken(Date.now())}>
                ▶ Preview
              </button>
            </div>
            {slide ? (
              <Scene
                slide={slide}
                selected={selected}
                onSelect={(id) => setSelected([id])}
                playToken={playToken}
              />
            ) : (
              <div className="stage-empty">Preparando composição…</div>
            )}
            <div className="notes">
              <label>Notas do apresentador</label>
              <textarea
                key={slide?.id}
                defaultValue={slide?.meta.notes}
                onBlur={(event) =>
                  slide &&
                  saveSlide({ ...slide.meta, notes: event.target.value })
                }
                placeholder="Escreva notas para quem vai apresentar…"
              />
            </div>
          </section>
          <aside className="inspector">
            <div className="tabs">
              <button
                className={tab === "animations" ? "active" : ""}
                onClick={() => setTab("animations")}
              >
                Animações
              </button>
              <button
                className={tab === "media" ? "active" : ""}
                onClick={() => setTab("media")}
              >
                Mídia
              </button>
              <button
                className={tab === "links" ? "active" : ""}
                onClick={() => setTab("links")}
              >
                Links
              </button>
            </div>
            <div className="inspector-scroll">
              {slide && (
                <>
                  <label className="status-row">
                    Status
                    <select
                      value={slide.meta.status}
                      onChange={(event) =>
                        saveSlide({
                          ...slide.meta,
                          status: event.target.value as SlideMeta["status"],
                        })
                      }
                    >
                      {["Draft", "Reviewing", "Approved", "Needs Changes"].map(
                        (status) => (
                          <option key={status}>{status}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <h3>LAYERS · {layers.length}</h3>
                  <div className="layer-tree">
                    {layers.map((item) => (
                      <button
                        className={selected.includes(item.id) ? "active" : ""}
                        key={item.id}
                        onClick={(event) => {
                          setSelected(
                            event.ctrlKey
                              ? selected.includes(item.id)
                                ? selected.filter((id) => id !== item.id)
                                : [...selected, item.id]
                              : [item.id],
                          );
                          void request("select", { id: item.id });
                        }}
                      >
                        {item.type === "TEXT" ? "T" : "◇"} {item.name}
                        <span>{item.meta.animations.length ? "●" : ""}</span>
                      </button>
                    ))}
                  </div>
                  {layer && tab === "animations" && (
                    <AnimationPanel
                      layer={layer}
                      onEffect={setMotion}
                      onChange={saveLayer}
                      onPlay={() => setPlayToken(Date.now())}
                    />
                  )}{" "}
                  {layer && tab === "media" && (
                    <MediaPanel layer={layer} onChange={saveLayer} />
                  )}{" "}
                  {layer && tab === "links" && (
                    <LinkPanel layer={layer} onChange={saveLayer} />
                  )}
                </>
              )}
            </div>
          </aside>
          {exportOpen && (
            <ExportPanel
              format={format}
              quality={quality}
              busy={busy}
              enabledCount={enabled.length}
              googleToken={googleToken}
              googleLink={googleLink}
              onFormat={setFormat}
              onQuality={setQuality}
              onGoogleToken={setGoogleToken}
              onClose={() => setExportOpen(false)}
              onExport={() => void runExport()}
            />
          )}
        </div>
      )}
    </main>
  );
}

function TopBar({
  saved,
  loaded,
  onSlides,
  onExport,
  onRefresh,
}: {
  saved: string;
  loaded: boolean;
  onSlides: () => void;
  onExport: () => void;
  onRefresh: () => void;
}) {
  return (
    <header className="topbar">
      <img src={LOGO} />
      <span className="save-state">{saved}</span>
      <span className="window-size">
        Janela
        <button title="Janela compacta" onClick={() => request("resize", { width: 900, height: 640 })}>S</button>
        <button title="Janela grande" onClick={() => request("resize", { width: 1380, height: 880 })}>L</button>
        <button title="Janela extra grande" onClick={() => request("resize", { width: 1700, height: 1000 })}>XL</button>
      </span>
      {loaded && <button onClick={onSlides}>Slides</button>}
      {loaded && (
        <button className="primary" onClick={onExport}>
          Exportar
        </button>
      )}
      <button onClick={onRefresh}>Atualizar do Figma</button>
    </header>
  );
}
function SlideRail({ids,enabled,active,frames,thumbs,onActive,onEnabled,onOrder,onRefresh}:{ids:string[];enabled:string[];active:string;frames:FrameInfo[];thumbs:Record<string,string>;onActive:(id:string)=>void;onEnabled:(ids:string[])=>void;onOrder:(ids:string[])=>void;onRefresh:()=>void}){
  const move=(id:string,delta:number)=>{const from=ids.indexOf(id),to=Math.max(0,Math.min(ids.length-1,from+delta));if(from===to)return;const next=[...ids];next.splice(to,0,next.splice(from,1)[0]);onOrder(next);};
  return <aside className="slide-panel"><div className="panel-heading"><label><input type="checkbox" checked={enabled.length===ids.length} onChange={event=>onEnabled(event.target.checked?[...ids]:[])}/><b>{enabled.length}/{ids.length} ativos</b></label><button title="Atualizar miniaturas" onClick={onRefresh}>↻</button></div>{ids.map((id,index)=><div className={'slide-card '+(id===active?'active ':'')+(!enabled.includes(id)?'disabled':'')} key={id} draggable onDragStart={event=>event.dataTransfer.setData('text/plain',id)} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const from=event.dataTransfer.getData('text/plain');if(!ids.includes(from))return;const next=ids.filter(item=>item!==from);next.splice(index,0,from);onOrder(next);}}><button className="thumb-button" onClick={()=>onActive(id)}>{thumbs[id]?<img src={thumbs[id]}/>:<span className="thumb-placeholder"/>}<span className="slide-index">{index+1}</span></button><div className="slide-actions"><label title="Incluir na exportação"><input type="checkbox" checked={enabled.includes(id)} onChange={event=>onEnabled(event.target.checked?[...enabled,id]:enabled.filter(item=>item!==id))}/></label><small>{frames.find(frame=>frame.id===id)?.name}</small><button disabled={index===0} title="Subir" onClick={()=>move(id,-1)}>↑</button><button disabled={index===ids.length-1} title="Descer" onClick={()=>move(id,1)}>↓</button><span title="Arraste para reordenar">⠿</span></div></div>)}</aside>;
}
function AnimationPanel({
  layer,
  onEffect,
  onChange,
  onPlay,
}: {
  layer: ReturnType<typeof flatten>[number];
  onEffect: (effect: Motion["effect"]) => void;
  onChange: (meta: LayerMeta) => void;
  onPlay: () => void;
}) {
  const motion = layer.meta.animations[0];
  return (
    <div className="tool-panel">
      <h3>ANIMAÇÃO</h3>
      <label>
        Efeito
        <select
          value={motion?.effect ?? ""}
          onChange={(event) => onEffect(event.target.value as Motion["effect"])}
        >
          <option value="">Sem animação</option>
          {effects.map((effect) => (
            <option value={effect} key={effect}>
              {effect.replace("-", " ")}
            </option>
          ))}
        </select>
      </label>
      {motion && (
        <>
          <label>
            Gatilho
            <select
              value={motion.trigger}
              onChange={(event) =>
                onChange({
                  ...layer.meta,
                  animations: [
                    {
                      ...motion,
                      trigger: event.target.value as Motion["trigger"],
                    },
                  ],
                })
              }
            >
              {[
                "enter",
                "with-previous",
                "after-previous",
                "click",
                "hover",
                "manual",
                "auto",
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <div className="dual">
            <label>
              Delay
              <input
                type="number"
                min="0"
                step="50"
                value={motion.delay}
                onChange={(event) =>
                  onChange({
                    ...layer.meta,
                    animations: [
                      { ...motion, delay: Number(event.target.value) },
                    ],
                  })
                }
              />
            </label>
            <label>
              Duração
              <input
                type="number"
                min="100"
                step="50"
                value={motion.duration}
                onChange={(event) =>
                  onChange({
                    ...layer.meta,
                    animations: [
                      { ...motion, duration: Number(event.target.value) },
                    ],
                  })
                }
              />
            </label>
          </div>
          <label>
            Easing
            <select
              value={motion.easing}
              onChange={(event) =>
                onChange({
                  ...layer.meta,
                  animations: [{ ...motion, easing: event.target.value }],
                })
              }
            >
              <option>linear</option>
              <option>ease</option>
              <option>ease-in</option>
              <option>ease-out</option>
              <option>ease-in-out</option>
              <option>cubic-bezier(.2,.8,.2,1)</option>
            </select>
          </label>
          <div className="timeline-row">
            <span
              style={{
                marginLeft: `${Math.min(60, motion.delay / 50)}px`,
                width: `${Math.max(32, Math.min(150, motion.duration / 10))}px`,
              }}
            />
          </div>
          <button className="primary wide" onClick={onPlay}>
            ▶ Testar animação
          </button>
          <button
            className="danger wide"
            onClick={() => onChange({ ...layer.meta, animations: [] })}
          >
            Remover animação
          </button>
        </>
      )}
    </div>
  );
}
function MediaPanel({
  layer,
  onChange,
}: {
  layer: ReturnType<typeof flatten>[number];
  onChange: (meta: LayerMeta) => void;
}) {
  return (
    <div className="tool-panel">
      <h3>VÍDEO / EMBED</h3>
      <label>
        URL
        <input
          defaultValue={layer.meta.video}
          onBlur={(event) =>
            onChange({ ...layer.meta, video: event.target.value })
          }
          placeholder="MP4, YouTube, Vimeo ou Loom"
        />
      </label>
      <div className="checks">
        <label>
          <input
            type="checkbox"
            checked={layer.meta.autoplay}
            onChange={(event) =>
              onChange({ ...layer.meta, autoplay: event.target.checked })
            }
          />{" "}
          Autoplay
        </label>
        <label>
          <input
            type="checkbox"
            checked={layer.meta.muted}
            onChange={(event) =>
              onChange({ ...layer.meta, muted: event.target.checked })
            }
          />{" "}
          Mudo
        </label>
        <label>
          <input
            type="checkbox"
            checked={layer.meta.loop}
            onChange={(event) =>
              onChange({ ...layer.meta, loop: event.target.checked })
            }
          />{" "}
          Loop
        </label>
      </div>
    </div>
  );
}
function LinkPanel({
  layer,
  onChange,
}: {
  layer: ReturnType<typeof flatten>[number];
  onChange: (meta: LayerMeta) => void;
}) {
  return (
    <div className="tool-panel">
      <h3>DESTINO</h3>
      <label>
        URL, e-mail ou telefone
        <input
          defaultValue={layer.meta.url}
          onBlur={(event) =>
            onChange({ ...layer.meta, url: event.target.value })
          }
          placeholder="https://, mailto: ou tel:"
        />
      </label>
      <label>
        Ir para slide
        <input
          defaultValue={layer.meta.targetSlide}
          onBlur={(event) =>
            onChange({ ...layer.meta, targetSlide: event.target.value })
          }
          placeholder="ID do slide"
        />
      </label>
    </div>
  );
}
function ExportPanel({
  format,
  quality,
  busy,
  enabledCount,
  googleToken,
  googleLink,
  onFormat,
  onQuality,
  onGoogleToken,
  onClose,
  onExport,
}: {
  format: ExportKind;
  quality: number;
  busy: string;
  enabledCount: number;
  googleToken: string;
  googleLink: string;
  onFormat: (value: ExportKind) => void;
  onQuality: (value: number) => void;
  onGoogleToken: (value: string) => void;
  onClose: () => void;
  onExport: () => void;
}) {
  const names = {
    pdf: "PDF Deck (.pdf)",
    pptx: "PowerPoint editável (.pptx)",
    google: "Google Apresentações",
    web: "Apresentação web (.html)",
    png: "Imagens PNG (.zip)",
  };
  return (
    <aside className="export-panel">
      <div className="export-title">
        <b>Exportar apresentação</b>
        <button onClick={onClose}>×</button>
      </div>
      <label>
        Formato
        <select
          value={format}
          onChange={(event) => onFormat(event.target.value as ExportKind)}
        >
          {Object.entries(names).map(([value, name]) => (
            <option value={value} key={value}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <div className="format-list">
        {Object.entries(names).map(([value, name]) => (
          <button
            className={format === value ? "active" : ""}
            onClick={() => onFormat(value as ExportKind)}
            key={value}
          >
            <span>
              {value === "pdf" ? "PDF" : value === "pptx" ? "PPT" : "◫"}
            </span>
            {name}
          </button>
        ))}
      </div>
      <label>
        Qualidade
        <select
          value={quality}
          onChange={(event) => onQuality(Number(event.target.value))}
        >
          <option value=".75">Leve · 72 dpi</option>
          <option value="1">Alta · 150 dpi</option>
          <option value="2">Original · 300 dpi</option>
        </select>
      </label>
      {format === "google" && <div className="google-connect"><label>Token OAuth do Google Drive<input type="password" value={googleToken} onChange={event=>onGoogleToken(event.target.value)} placeholder="Cole o access token da integração"/></label><small>Escopo necessário: drive.file. O arquivo é convertido no seu Drive.</small></div>}
      <div className="export-options">
        <label>
          <input type="checkbox" defaultChecked /> Reduzir imagens muito grandes
        </label>
        <label><input type="checkbox" checked readOnly /> Preservar textos, formas e posições editáveis</label>
      </div>
      <div className="export-summary">
        <span>{busy || "Pronto para exportar"}</span>
        <small>{enabledCount} slides ativos, na ordem mostrada à esquerda.</small>
      </div>
      {googleLink && <a className="google-link" href={googleLink} target="_blank" rel="noreferrer">Abrir no Google Apresentações ↗</a>}
      <button
        className="primary wide export-now"
        disabled={!!busy}
        onClick={onExport}
      >
        Exportar {names[format]}
      </button>
    </aside>
  );
}
