import { useEffect, useMemo, useRef, useState } from "react";
import { seedPalettes } from "../seed";
import { contrastRatio, exportCss, exportTokens, formatColor, normalizeHex, simulateVision, slugify, validatePalette, validateState } from "../palette-utils";
import type { ColorFormat, Palette, PaletteColor, StudioState, VisionMode } from "../types";

type View = "studio" | "contrast" | "export" | "library";
const STORAGE_KEY = "color-palette-studio-v2";

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)); }
function uid(prefix: string): string { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
function initialState(): StudioState {
  const shared = new URLSearchParams(window.location.search).get("palette");
  if (shared) {
    try {
      const palette = JSON.parse(decodeURIComponent(atob(shared)));
      if (validatePalette(palette)) return { palettes: [palette], activePaletteId: palette.id };
    } catch { /* Ignore malformed shared links. */ }
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (validateState(saved)) return saved;
  } catch { /* Fall back to seeds. */ }
  return { palettes: clone(seedPalettes), activePaletteId: seedPalettes[0].id };
}

function download(name: string, value: string, type = "text/plain") {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([value], { type }));
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function App() {
  const [state, setState] = useState<StudioState>(initialState);
  const [view, setView] = useState<View>("studio");
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [vision, setVision] = useState<VisionMode>("normal");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<StudioState[]>([]);
  const [future, setFuture] = useState<StudioState[]>([]);
  const [presentation, setPresentation] = useState(new URLSearchParams(window.location.search).get("mode") === "present");
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const active = state.palettes.find((palette) => palette.id === state.activePaletteId) || state.palettes[0];

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timeout);
  }, []);
  useEffect(() => {
    const exitPresentation = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPresentation(false);
    };
    window.addEventListener("keydown", exitPresentation);
    return () => window.removeEventListener("keydown", exitPresentation);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const commit = (mutate: (draft: StudioState) => void) => {
    setHistory((items) => [...items.slice(-29), clone(state)]);
    setFuture([]);
    const next = clone(state);
    mutate(next);
    setState(next);
  };

  const updateActive = (change: (palette: Palette) => void) => commit((draft) => {
    const palette = draft.palettes.find((item) => item.id === draft.activePaletteId);
    if (!palette) return;
    change(palette);
    palette.updatedAt = new Date().toISOString();
  });

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setFuture((items) => [clone(state), ...items]);
    setHistory((items) => items.slice(0, -1));
    setState(previous);
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setHistory((items) => [...items, clone(state)]);
    setFuture((items) => items.slice(1));
    setState(next);
  };

  const changeColor = (id: string, patch: Partial<PaletteColor>) => updateActive((palette) => {
    palette.colors = palette.colors.map((color) => color.id === id ? { ...color, ...patch } : color);
  });
  const moveColor = (index: number, offset: number) => updateActive((palette) => {
    const destination = index + offset;
    if (destination < 0 || destination >= palette.colors.length) return;
    [palette.colors[index], palette.colors[destination]] = [palette.colors[destination], palette.colors[index]];
  });
  const addColor = (name: string, value: string) => updateActive((palette) => palette.colors.push({
    id: uid(slugify(name) || "color"),
    name: name.trim() || "Untitled color",
    value,
  }));
  const removeColor = (id: string) => updateActive((palette) => {
    if (palette.colors.length > 2) palette.colors = palette.colors.filter((color) => color.id !== id);
  });

  const copy = async (value: string, message = "Copied to clipboard") => {
    await navigator.clipboard.writeText(value);
    setNotice(message);
  };
  const share = async () => {
    setIsSharing(true);
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(active)));
      const url = `${window.location.origin}${window.location.pathname}?palette=${encoded}`;
      await copy(url, "Share link copied");
    } finally {
      window.setTimeout(() => setIsSharing(false), 300);
    }
  };
  const saveVersion = (name: string) => updateActive((palette) => palette.versions.unshift({ id: uid("version"), name, savedAt: new Date().toISOString(), colors: clone(palette.colors) }));
  const restoreVersion = (id: string) => updateActive((palette) => {
    const version = palette.versions.find((item) => item.id === id);
    if (version) palette.colors = clone(version.colors);
  });
  const duplicate = (palette: Palette) => commit((draft) => {
    const copyPalette = { ...clone(palette), id: uid(slugify(palette.name)), name: `${palette.name} copy`, versions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    draft.palettes.push(copyPalette);
    draft.activePaletteId = copyPalette.id;
    setView("studio");
  });
  const createPalette = () => commit((draft) => {
    const palette: Palette = { id: uid("untitled"), name: "Untitled palette", description: "A new color system.", collection: "Unsorted", colors: [{ id: uid("ink"), name: "Ink", value: "#20232A" }, { id: uid("accent"), name: "Accent", value: "#61DAFB" }, { id: uid("surface"), name: "Surface", value: "#F3F7FA" }], versions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    draft.palettes.push(palette);
    draft.activePaletteId = palette.id;
    setView("studio");
  });
  const deletePalette = (id: string) => commit((draft) => {
    if (draft.palettes.length <= 1) return;
    draft.palettes = draft.palettes.filter((palette) => palette.id !== id);
    if (draft.activePaletteId === id) draft.activePaletteId = draft.palettes[0].id;
  });
  const importPalette = async (file?: File) => {
    if (!file) return;
    try {
      const candidate = JSON.parse(await file.text());
      const palette = candidate.palette || candidate;
      if (!validatePalette(palette)) throw new Error("The file does not contain a valid palette.");
      commit((draft) => { draft.palettes.push(palette); draft.activePaletteId = palette.id; });
      setNotice("Palette imported");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Import failed"); }
  };

  const visiblePalettes = useMemo(() => state.palettes.filter((palette) => `${palette.name} ${palette.collection} ${palette.description}`.toLowerCase().includes(search.toLowerCase())), [search, state.palettes]);
  const exportJson = JSON.stringify(active, null, 2);

  return (
    <div className={presentation ? "app presentation" : "app"}>
      <div className={isLoading ? "loading-screen" : "loading-screen loaded"} aria-hidden={!isLoading}>
        <span className="loader-mark">✦</span>
        <span className="loader-line" />
        <strong>Preparing your palettes</strong>
      </div>
      <a className="skip-link" href="#main">Skip to workspace</a>
      <header className="topbar">
        <button className="brand" onClick={() => setView("studio")} aria-label="Open Color Palette Studio">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span><strong>Color Palette</strong><small>Studio</small></span>
        </button>
        <nav aria-label="Workspace">
          {(["studio", "contrast", "export", "library"] as View[]).map((item) => <button key={item} className={view === item ? "nav-link active" : "nav-link"} onClick={() => setView(item)}>{item}</button>)}
        </nav>
        <div className="top-actions">
          <button className="icon-button" onClick={undo} disabled={!history.length} aria-label="Undo">↶</button>
          <button className="icon-button" onClick={redo} disabled={!future.length} aria-label="Redo">↷</button>
          <button className="button secondary presentation-toggle" onClick={() => setPresentation(!presentation)}>{presentation ? "← Exit presentation" : "Present"}</button>
          <button className="button secondary new-palette" onClick={createPalette}>+ New palette</button>
          <button className="button primary" onClick={share} disabled={isSharing}>{isSharing ? <><span className="spinner" /> Sharing…</> : "Share palette"}</button>
        </div>
      </header>

      <main id="main" className="workspace">
        <aside className="sidebar" aria-label="Palettes">
          <div className="sidebar-heading"><span>Palettes</span><small>{state.palettes.length}</small></div>
          <label className="search"><span className="sr-only">Search palettes</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search palettes…" /></label>
          <div className="palette-list">
            {visiblePalettes.map((palette) => (
              <button key={palette.id} className={palette.id === active.id ? "palette-item selected" : "palette-item"} onClick={() => { setState((current) => ({ ...current, activePaletteId: palette.id })); setView("studio"); }}>
                <span className="mini-colors">{palette.colors.slice(0, 5).map((color) => <i key={color.id} style={{ background: color.value }} />)}</span>
                <span><strong>{palette.name}</strong><small>{palette.collection} · {palette.colors.length} colors</small></span>
              </button>
            ))}
          </div>
          <input ref={importRef} hidden type="file" accept="application/json" onChange={(event) => importPalette(event.target.files?.[0])} />
          <button className="button secondary full" onClick={() => importRef.current?.click()}>Import JSON</button>
        </aside>

        <section className="content content-enter" key={`${view}-${active.id}`} aria-live="polite">
          {view === "studio" && <Studio palette={active} format={format} vision={vision} onFormat={setFormat} onVision={setVision} onMeta={(field, value) => updateActive((palette) => { palette[field] = value; })} onColor={changeColor} onMove={moveColor} onAdd={addColor} onRemove={removeColor} onCopy={copy} onVersion={saveVersion} onRestore={restoreVersion} />}
          {view === "contrast" && <Contrast palette={active} />}
          {view === "export" && <ExportPanel palette={active} json={exportJson} onCopy={copy} />}
          {view === "library" && <Library palettes={visiblePalettes} onOpen={(id) => { setState((current) => ({ ...current, activePaletteId: id })); setView("studio"); }} onDuplicate={duplicate} onDelete={deletePalette} />}
        </section>
      </main>
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  );
}

function Studio({ palette, format, vision, onFormat, onVision, onMeta, onColor, onMove, onAdd, onRemove, onCopy, onVersion, onRestore }: { palette: Palette; format: ColorFormat; vision: VisionMode; onFormat: (value: ColorFormat) => void; onVision: (value: VisionMode) => void; onMeta: (field: "name" | "description" | "collection", value: string) => void; onColor: (id: string, patch: Partial<PaletteColor>) => void; onMove: (index: number, offset: number) => void; onAdd: (name: string, value: string) => void; onRemove: (id: string) => void; onCopy: (value: string) => void; onVersion: (name: string) => void; onRestore: (id: string) => void; }) {
  const [newColorName, setNewColorName] = useState("New color");
  const [newColorValue, setNewColorValue] = useState("#61DAFB");
  const [showColorComposer, setShowColorComposer] = useState(false);
  const [checkpointName, setCheckpointName] = useState("");
  const submitColor = (event: React.FormEvent) => {
    event.preventDefault();
    const value = normalizeHex(newColorValue);
    if (!value) return;
    onAdd(newColorName, value);
    setNewColorName("New color");
    setShowColorComposer(false);
  };
  const submitCheckpoint = (event: React.FormEvent) => {
    event.preventDefault();
    const name = checkpointName.trim();
    if (!name) return;
    onVersion(name);
    setCheckpointName("");
  };
  return <>
    <div className="content-header">
      <div><span className="eyebrow">Active palette</span><input className="title-input" value={palette.name} onChange={(event) => onMeta("name", event.target.value)} aria-label="Palette name" /><input className="description-input" value={palette.description} onChange={(event) => onMeta("description", event.target.value)} aria-label="Palette description" /></div>
      <div className="header-controls"><div className="toolbar"><label>Format<select value={format} onChange={(event) => onFormat(event.target.value as ColorFormat)}><option value="hex">HEX</option><option value="rgb">RGB</option><option value="hsl">HSL</option></select></label><label>Vision preview<select value={vision} onChange={(event) => onVision(event.target.value as VisionMode)}><option value="normal">Standard</option><option value="protanopia">Protanopia</option><option value="deuteranopia">Deuteranopia</option><option value="tritanopia">Tritanopia</option><option value="achromatopsia">Achromatopsia</option></select></label></div><button className="button primary add-color-action" onClick={() => setShowColorComposer((visible) => !visible)}>{showColorComposer ? "Close" : "+ Add color"}</button></div>
    </div>
    {showColorComposer && <form className="color-composer" onSubmit={submitColor}>
      <div className="composer-preview" style={{ background: newColorValue }}><span>Live preview</span><strong>{newColorValue}</strong></div>
      <label>Name<input value={newColorName} onChange={(event) => setNewColorName(event.target.value)} placeholder="Color name" autoFocus required /></label>
      <label>HEX<div className="color-input"><input type="color" value={newColorValue} onChange={(event) => setNewColorValue(event.target.value.toUpperCase())} /><input value={newColorValue} onChange={(event) => setNewColorValue(event.target.value.toUpperCase())} pattern="#[0-9A-Fa-f]{6}" aria-label="New color hex value" required /></div></label>
      <button className="button primary" type="submit">Add to palette</button>
    </form>}
    <div className="palette-grid">
      {palette.colors.map((color, index) => {
        const preview = simulateVision(color.value, vision);
        const text = contrastRatio(preview, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#090B10";
        return <article className="color-card" key={color.id}>
          <button className="swatch" style={{ background: preview, color: text }} onClick={() => onCopy(formatColor(color.value, format))} aria-label={`Copy ${color.name} as ${format}`}><span>Copy</span><strong>{formatColor(color.value, format)}</strong></button>
          <div className="color-fields"><input value={color.name} onChange={(event) => onColor(color.id, { name: event.target.value })} aria-label={`Name for ${color.value}`} /><label className="color-input"><input type="color" value={color.value} onChange={(event) => onColor(color.id, { value: event.target.value.toUpperCase() })} /><input value={color.value} onChange={(event) => { const value = normalizeHex(event.target.value); if (value) onColor(color.id, { value }); }} aria-label={`Hex value for ${color.name}`} /></label></div>
          <div className="card-actions"><button onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={`Move ${color.name} left`}>←</button><button onClick={() => onMove(index, 1)} disabled={index === palette.colors.length - 1} aria-label={`Move ${color.name} right`}>→</button><button onClick={() => onRemove(color.id)} disabled={palette.colors.length <= 2} aria-label={`Delete ${color.name}`}>Delete</button></div>
        </article>;
      })}
    </div>
    <section className="version-panel"><div className="checkpoint-copy"><span className="eyebrow">Version history</span><h2>Save a checkpoint</h2><p>Name this palette state so it is easy to recognize and restore later.</p></div><form className="checkpoint-form" onSubmit={submitCheckpoint}><label htmlFor="checkpoint-name">Checkpoint name</label><div><input id="checkpoint-name" value={checkpointName} onChange={(event) => setCheckpointName(event.target.value)} placeholder="e.g. Client review" required /><button className="button secondary" type="submit">Save checkpoint</button></div></form><div className="version-list">{palette.versions.slice(0, 4).map((version) => <button className="version" key={version.id} onClick={() => onRestore(version.id)}><span className="mini-colors">{version.colors.slice(0, 5).map((color) => <i key={color.id} style={{ background: color.value }} />)}</span><span><strong>{version.name || "Untitled checkpoint"}</strong><small>{new Date(version.savedAt).toLocaleString()}</small></span></button>)}</div></section>
  </>;
}

function Contrast({ palette }: { palette: Palette }) {
  return <><div className="content-header"><div><span className="eyebrow">Accessibility lab</span><h1>Contrast matrix</h1><p>WCAG ratios for every foreground and background combination. AA requires 4.5:1 for body text and 3:1 for large text.</p></div></div><div className="matrix-wrap"><table className="matrix"><thead><tr><th>Foreground ↓ / Background →</th>{palette.colors.map((color) => <th key={color.id}>{color.name}</th>)}</tr></thead><tbody>{palette.colors.map((foreground) => <tr key={foreground.id}><th>{foreground.name}</th>{palette.colors.map((background) => { const ratio = contrastRatio(foreground.value, background.value); return <td key={background.id} style={{ background: background.value, color: foreground.value }}><strong>{ratio.toFixed(2)}</strong><small>{ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "Large" : "Fail"}</small></td>; })}</tr>)}</tbody></table></div><section className="suggestions"><span className="eyebrow">Recommended pairs</span><h2>Accessible combinations</h2><div className="pair-grid">{palette.colors.flatMap((foreground) => palette.colors.map((background) => ({ foreground, background, ratio: contrastRatio(foreground.value, background.value) }))).filter((pair) => pair.foreground.id !== pair.background.id && pair.ratio >= 4.5).sort((a, b) => b.ratio - a.ratio).slice(0, 6).map((pair) => <article className="pair" key={`${pair.foreground.id}-${pair.background.id}`} style={{ background: pair.background.value, color: pair.foreground.value }}><strong>{pair.foreground.name}</strong><span>on {pair.background.name}</span><small>{pair.ratio.toFixed(2)}:1 · {pair.ratio >= 7 ? "AAA" : "AA"}</small></article>)}</div></section></>;
}

function ExportPanel({ palette, json, onCopy }: { palette: Palette; json: string; onCopy: (value: string, message?: string) => void }) {
  const css = exportCss(palette.colors); const tokens = exportTokens(palette);
  return <><div className="content-header"><div><span className="eyebrow">Design handoff</span><h1>Export tokens</h1><p>Move this palette into code, design tooling, or another Color Palette Studio workspace.</p></div></div><div className="export-grid"><ExportCard title="CSS custom properties" language="css" value={css} onCopy={onCopy} onDownload={() => download(`${palette.id}.css`, css, "text/css")} /><ExportCard title="Portable palette JSON" language="json" value={json} onCopy={onCopy} onDownload={() => download(`${palette.id}.json`, json, "application/json")} /><ExportCard title="W3C design tokens" language="json" value={tokens} onCopy={onCopy} onDownload={() => download(`${palette.id}.tokens.json`, tokens, "application/json")} /></div></>;
}
function ExportCard({ title, language, value, onCopy, onDownload }: { title: string; language: string; value: string; onCopy: (value: string, message?: string) => void; onDownload: () => void }) { return <article className="export-card"><div><span className="eyebrow">{language}</span><h2>{title}</h2></div><pre><code>{value}</code></pre><div className="row"><button className="button secondary" onClick={() => onCopy(value, `${title} copied`)}>Copy</button><button className="button primary" onClick={onDownload}>Download</button></div></article>; }

function Library({ palettes, onOpen, onDuplicate, onDelete }: { palettes: Palette[]; onOpen: (id: string) => void; onDuplicate: (palette: Palette) => void; onDelete: (id: string) => void }) {
  return <><div className="content-header"><div><span className="eyebrow">Collections</span><h1>Palette library</h1><p>Organize, duplicate, and reuse color systems stored in this browser.</p></div></div><div className="library-grid">{palettes.map((palette) => <article className="library-card" key={palette.id}><button className="library-preview" onClick={() => onOpen(palette.id)} aria-label={`Open ${palette.name}`}>{palette.colors.map((color) => <i key={color.id} style={{ background: color.value }} />)}</button><div><span className="eyebrow">{palette.collection}</span><h2>{palette.name}</h2><p>{palette.description}</p><small>Updated {new Date(palette.updatedAt).toLocaleDateString()}</small></div><div className="row"><button className="button primary" onClick={() => onOpen(palette.id)}>Open</button><button className="button secondary" onClick={() => onDuplicate(palette)}>Duplicate</button><button className="button ghost danger" onClick={() => onDelete(palette.id)}>Delete</button></div></article>)}</div></>;
}
