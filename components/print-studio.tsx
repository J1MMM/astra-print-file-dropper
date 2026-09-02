"use client";
/* eslint-disable @next/next/no-img-element -- previews can be blob: or short-lived signed URLs */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  ArrowLeft,
  ClipboardPaste,
  FileDown,
  GripVertical,
  ImagePlus,
  Link2,
  LoaderCircle,
  Printer,
  RotateCw,
  Trash2,
  Unlink2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { renderImageForPdf, safePdfName } from "@/lib/pdf-layout";

type PaperKey =
  "a4" | "a3" | "a5" | "letter" | "legal" | "folio" | "photo4x6" | "photo5x7";
type Orientation = "portrait" | "landscape";
type Fit = "cover" | "contain";
type Color = "color" | "grayscale" | "sepia";
type Margins = { top: number; right: number; bottom: number; left: number };
type ImageItem = {
  id: string;
  url: string;
  name: string;
  rotation: number;
  local?: boolean;
};
const papers: Record<PaperKey, { label: string; w: number; h: number }> = {
  a4: { label: "A4", w: 210, h: 297 },
  a3: { label: "A3", w: 297, h: 420 },
  a5: { label: "A5", w: 148, h: 210 },
  letter: { label: "Letter", w: 215.9, h: 279.4 },
  legal: { label: "Legal", w: 215.9, h: 355.6 },
  folio: { label: "Folio", w: 215.9, h: 330.2 },
  photo4x6: { label: "4 × 6 in", w: 101.6, h: 152.4 },
  photo5x7: { label: "5 × 7 in", w: 127, h: 177.8 },
};
const layouts = [
  { n: 1, r: 1, c: 1 },
  { n: 2, r: 1, c: 2 },
  { n: 4, r: 2, c: 2 },
  { n: 6, r: 2, c: 3 },
  { n: 9, r: 3, c: 3 },
];
const chunks = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, (i + 1) * size),
  );
export function PrintStudio({
  initial = [],
  title = "Untitled layout",
}: {
  initial: { id: string; url: string; name: string }[];
  title?: string;
}) {
  const [images, setImages] = useState<ImageItem[]>(
      initial.map((i) => ({ ...i, rotation: 0 })),
    ),
    [paperKey, setPaperKey] = useState<PaperKey>("a4"),
    [orientation, setOrientation] = useState<Orientation>("portrait"),
    [slots, setSlots] = useState(1),
    [fit, setFit] = useState<Fit>("cover"),
    [color, setColor] = useState<Color>("color"),
    [gap, setGap] = useState(4),
    [margins, setMargins] = useState<Margins>({
      top: 8,
      right: 8,
      bottom: 8,
      left: 8,
    }),
    [linked, setLinked] = useState(true),
    [border, setBorder] = useState(false),
    [dragging, setDragging] = useState(false),
    [exportingPdf, setExportingPdf] = useState(false);
  const input = useRef<HTMLInputElement>(null),
    dragIndex = useRef<number | null>(null),
    urls = useRef(new Set<string>());
  useEffect(
    () => () => {
      urls.current.forEach(URL.revokeObjectURL);
    },
    [],
  );
  const add = useCallback((list: FileList | File[] | null) => {
    const files = Array.from(list ?? []).filter((f) =>
      f.type.startsWith("image/"),
    );
    setImages((old) => [
      ...old,
      ...files.map((file, index) => {
        const url = URL.createObjectURL(file);
        urls.current.add(url);
        return {
          id: `local-${Date.now()}-${index}`,
          url,
          name: file.name,
          rotation: 0,
          local: true,
        };
      }),
    ]);
  }, []);
  useEffect(() => {
    const paste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (files.length) {
        e.preventDefault();
        add(files);
      }
    };
    window.addEventListener("paste", paste);
    return () => window.removeEventListener("paste", paste);
  }, [add]);
  const layout = layouts.find((l) => l.n === slots) ?? layouts[2],
    pages = useMemo(() => chunks(images, slots), [images, slots]),
    paper = papers[paperKey],
    w = orientation === "portrait" ? paper.w : paper.h,
    h = orientation === "portrait" ? paper.h : paper.w;
  const remove = (id: string) =>
    setImages((old) => {
      const found = old.find((i) => i.id === id);
      if (found?.local) {
        URL.revokeObjectURL(found.url);
        urls.current.delete(found.url);
      }
      return old.filter((i) => i.id !== id);
    });
  const setMargin = (side: keyof Margins, value: number) =>
    setMargins((old) =>
      linked
        ? { top: value, right: value, bottom: value, left: value }
        : { ...old, [side]: value },
    );
  const reorder = (to: number) => {
    const from = dragIndex.current;
    if (from === null || from === to) return;
    setImages((old) => {
      const copy = [...old];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
    dragIndex.current = null;
  };
  const downloadPdf = async () => {
    if (!images.length || exportingPdf) return;
    setExportingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdfOrientation = w > h ? "landscape" : "portrait";
      const pdf = new jsPDF({
        orientation: pdfOrientation,
        unit: "mm",
        format: [w, h],
        compress: true,
      });
      const slotW =
        (w - margins.left - margins.right - gap * (layout.c - 1)) / layout.c;
      const slotH =
        (h - margins.top - margins.bottom - gap * (layout.r - 1)) / layout.r;
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        if (pageIndex > 0) pdf.addPage([w, h], pdfOrientation);
        for (
          let imageIndex = 0;
          imageIndex < pages[pageIndex].length;
          imageIndex++
        ) {
          const image = pages[pageIndex][imageIndex];
          const row = Math.floor(imageIndex / layout.c);
          const column = imageIndex % layout.c;
          const x = margins.left + column * (slotW + gap);
          const y = margins.top + row * (slotH + gap);
          const rendered = await renderImageForPdf(image.url, slotW / slotH, {
            fit,
            color,
            rotation: image.rotation,
          });
          pdf.addImage(rendered, "JPEG", x, y, slotW, slotH, undefined, "FAST");
          if (border) {
            pdf.setDrawColor(185);
            pdf.setLineWidth(0.2);
            pdf.rect(x, y, slotW, slotH);
          }
        }
      }
      pdf.save(safePdfName(title));
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "The PDF could not be created.",
      );
    } finally {
      setExportingPdf(false);
    }
  };
  return (
    <div className="studio">
      <style>{`@page{size:${w}mm ${h}mm;margin:0}@media print{.print-sheet{width:${w}mm!important;height:${h}mm!important}}`}</style>
      <header className="studio-head">
        <div>
          <Link href="/admin/entries">
            <ArrowLeft size={15} />
            Entries
          </Link>
          <span>/</span>
          <strong>{title}</strong>
        </div>
        <div className="studio-head-actions">
          <button
            className="pill"
            onClick={downloadPdf}
            disabled={!images.length || exportingPdf}
            aria-label="Download layout as PDF"
            title="Download layout as PDF"
          >
            {exportingPdf ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <FileDown size={17} />
            )}
            <span>{exportingPdf ? "Creating PDF…" : "Download PDF"}</span>
          </button>
          <button
            className="pill primary"
            onClick={() => window.print()}
            disabled={!images.length}
            aria-label="Print layout"
            title="Print layout"
          >
            <Printer size={17} />
            <span>
              Print {pages.length > 1 ? `${pages.length} sheets` : "sheet"}
            </span>
          </button>
        </div>
      </header>
      <div className="studio-body">
        <aside className="studio-controls">
          <section>
            <h3>
              <ImagePlus size={16} />
              Images <span>{images.length}</span>
            </h3>
            <div
              className={`studio-drop ${dragging ? "dragging" : ""}`}
              onClick={() => input.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e: DragEvent) => {
                e.preventDefault();
                setDragging(false);
                add(e.dataTransfer.files);
              }}
            >
              <Upload size={20} />
              <b>Drop or choose images</b>
              <small>JPG, PNG, WebP</small>
            </div>
            <input
              ref={input}
              hidden
              multiple
              type="file"
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                add(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              className="studio-paste"
              onClick={() =>
                navigator.clipboard
                  ?.read?.()
                  .then(async (items) => {
                    const fs: File[] = [];
                    for (const item of items) {
                      const type = item.types.find((t) =>
                        t.startsWith("image/"),
                      );
                      if (type) {
                        const blob = await item.getType(type);
                        fs.push(new File([blob], "pasted-image.png", { type }));
                      }
                    }
                    add(fs);
                  })
                  .catch(() => alert("Press Ctrl/Cmd + V to paste an image."))
              }
            >
              <ClipboardPaste size={14} />
              Paste from clipboard
            </button>
            {images.length > 0 && (
              <div className="studio-thumbs">
                {images.map((img, index) => (
                  <div
                    className="studio-thumb"
                    draggable
                    onDragStart={() => (dragIndex.current = index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => reorder(index)}
                    key={img.id}
                  >
                    <GripVertical size={14} />
                    <img
                      src={img.url}
                      alt=""
                      style={{ transform: `rotate(${img.rotation}deg)` }}
                    />
                    <span>{img.name}</span>
                    <button
                      type="button"
                      aria-label={`Rotate ${img.name}`}
                      title="Rotate 90°"
                      onClick={() =>
                        setImages((old) =>
                          old.map((i) =>
                            i.id === img.id
                              ? { ...i, rotation: (i.rotation + 90) % 360 }
                              : i,
                          ),
                        )
                      }
                    >
                      <RotateCw size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${img.name}`}
                      title="Remove image"
                      onClick={() => remove(img.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}{" "}
            {images.length > 0 && (
              <button
                className="studio-clear"
                onClick={() => [...images].forEach((i) => remove(i.id))}
              >
                <Trash2 size={13} />
                Clear all
              </button>
            )}
          </section>
          <section>
            <h3>Paper & layout</h3>
            <label>
              Paper size
              <select
                value={paperKey}
                onChange={(e) => setPaperKey(e.target.value as PaperKey)}
              >
                {Object.entries(papers).map(([key, p]) => (
                  <option key={key} value={key}>
                    {p.label} · {p.w} × {p.h} mm
                  </option>
                ))}
              </select>
            </label>
            <label>
              Orientation
              <div className="studio-seg">
                <button
                  className={orientation === "portrait" ? "on" : ""}
                  onClick={() => setOrientation("portrait")}
                >
                  Portrait
                </button>
                <button
                  className={orientation === "landscape" ? "on" : ""}
                  onClick={() => setOrientation("landscape")}
                >
                  Landscape
                </button>
              </div>
            </label>
            <label>
              Images per sheet
              <div className="layout-tiles">
                {layouts.map((l) => (
                  <button
                    className={slots === l.n ? "on" : ""}
                    onClick={() => setSlots(l.n)}
                    key={l.n}
                  >
                    <i
                      style={{
                        gridTemplateColumns: `repeat(${l.c},1fr)`,
                        gridTemplateRows: `repeat(${l.r},1fr)`,
                      }}
                    >
                      {Array.from({ length: l.n }, (_, i) => (
                        <b key={i} />
                      ))}
                    </i>
                    <small>{l.n}-up</small>
                  </button>
                ))}
              </div>
            </label>
          </section>
          <section>
            <h3>Adjust</h3>
            <label>
              Image fit
              <div className="studio-seg">
                <button
                  className={fit === "cover" ? "on" : ""}
                  onClick={() => setFit("cover")}
                >
                  Fill
                </button>
                <button
                  className={fit === "contain" ? "on" : ""}
                  onClick={() => setFit("contain")}
                >
                  Fit
                </button>
              </div>
            </label>
            <label>
              Color
              <div className="studio-seg">
                <button
                  className={color === "color" ? "on" : ""}
                  onClick={() => setColor("color")}
                >
                  Color
                </button>
                <button
                  className={color === "grayscale" ? "on" : ""}
                  onClick={() => setColor("grayscale")}
                >
                  B&W
                </button>
                <button
                  className={color === "sepia" ? "on" : ""}
                  onClick={() => setColor("sepia")}
                >
                  Sepia
                </button>
              </div>
            </label>
            <label>
              <span>
                Gap <b>{gap}mm</b>
              </span>
              <input
                type="range"
                min="0"
                max="20"
                value={gap}
                onChange={(e) => setGap(+e.target.value)}
              />
            </label>
            <label>
              <span>
                Margins{" "}
                <button
                  className="link-toggle"
                  onClick={() => setLinked(!linked)}
                >
                  {linked ? <Link2 size={12} /> : <Unlink2 size={12} />}
                </button>
              </span>
              {linked ? (
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={margins.top}
                  onChange={(e) => setMargin("top", +e.target.value)}
                />
              ) : (
                <div className="margin-grid">
                  {(Object.keys(margins) as (keyof Margins)[]).map((side) => (
                    <input
                      aria-label={`${side} margin`}
                      type="number"
                      min="0"
                      max="60"
                      value={margins[side]}
                      onChange={(e) => setMargin(side, +e.target.value)}
                      key={side}
                    />
                  ))}
                </div>
              )}
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={border}
                onChange={(e) => setBorder(e.target.checked)}
              />
              Hairline borders
            </label>
          </section>
        </aside>
        <main className="studio-canvas">
          {pages.length ? (
            pages.map((page, pageIndex) => (
              <div className="sheet-wrap" key={pageIndex}>
                <span>
                  Sheet {pageIndex + 1} of {pages.length} · {paper.label} · {w}{" "}
                  × {h}mm
                </span>
                <div
                  className="print-sheet"
                  style={{
                    aspectRatio: `${w}/${h}`,
                    width:
                      orientation === "portrait"
                        ? "min(100%, 560px)"
                        : "min(100%, 720px)",
                    padding: `${(margins.top / w) * 100}% ${(margins.right / w) * 100}% ${(margins.bottom / w) * 100}% ${(margins.left / w) * 100}%`,
                  }}
                >
                  <div
                    className="print-grid"
                    style={{
                      gridTemplateColumns: `repeat(${layout.c},1fr)`,
                      gridTemplateRows: `repeat(${layout.r},1fr)`,
                      columnGap: `${(gap / w) * 100}%`,
                      rowGap: `${(gap / h) * 100}%`,
                    }}
                  >
                    {Array.from({ length: slots }, (_, index) => {
                      const img = page[index];
                      return (
                        <div
                          className={`print-slot ${border ? "bordered" : ""}`}
                          key={index}
                        >
                          {img ? (
                            <img
                              src={img.url}
                              alt={img.name}
                              style={{
                                objectFit: fit,
                                filter:
                                  color === "grayscale"
                                    ? "grayscale(1)"
                                    : color === "sepia"
                                      ? "sepia(.7)"
                                      : "none",
                                transform: `rotate(${img.rotation}deg)`,
                              }}
                            />
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="studio-empty">
              <ImagePlus size={44} />
              <h2 className="display">Your layout is empty</h2>
              <p>
                Add images from the control panel, or paste one from your
                clipboard.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
