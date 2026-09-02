"use client";
/* eslint-disable @next/next/no-img-element -- editor supports local blobs and signed URLs */

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileDown,
  ImagePlus,
  LoaderCircle,
  Printer,
  RotateCcw,
  Upload,
} from "lucide-react";
import { renderImageForPdf, safePdfName } from "@/lib/pdf-layout";

type PaperKey = "3r" | "4r" | "5r";
type IdSizeKey = "1x1" | "2x2" | "passport";
type PackageKey = "custom" | "package-a" | "package-b";
type PhotoItem = { id: string; sizeKey: IdSizeKey; w: number; h: number };
type Placement = PhotoItem & { x: number; y: number };
type PhotoGroup = { sizeKey: IdSizeKey; count: number; columns: number };
const papers: Record<
  PaperKey,
  { label: string; w: number; h: number; detail: string }
> = {
  "3r": { label: "3R", w: 89, h: 127, detail: "3.5 × 5 in" },
  "4r": { label: "4R", w: 102, h: 152, detail: "4 × 6 in" },
  "5r": { label: "5R", w: 127, h: 178, detail: "5 × 7 in" },
};
const idSizes: Record<
  IdSizeKey,
  { label: string; w: number; h: number; detail: string }
> = {
  "1x1": { label: "1 × 1", w: 25.4, h: 25.4, detail: "25.4 × 25.4 mm" },
  "2x2": { label: "2 × 2", w: 50.8, h: 50.8, detail: "50.8 × 50.8 mm" },
  passport: { label: "Passport", w: 35, h: 45, detail: "35 × 45 mm" },
};
const packages: Record<
  Exclude<PackageKey, "custom">,
  { label: string; detail: string; groups: PhotoGroup[] }
> = {
  "package-a": {
    label: "Package A",
    detail: "4 pcs 2×2 + 8 pcs 1×1",
    groups: [
      { sizeKey: "2x2", count: 4, columns: 2 },
      { sizeKey: "1x1", count: 8, columns: 4 },
    ],
  },
  "package-b": {
    label: "Package B",
    detail: "5 pcs 2×2 + 4 pcs 1×1 + 3 passport",
    groups: [
      { sizeKey: "2x2", count: 5, columns: 2 },
      { sizeKey: "passport", count: 3, columns: 3 },
      { sizeKey: "1x1", count: 4, columns: 4 },
    ],
  },
};

function packPhotoGroups(
  groups: PhotoGroup[],
  width: number,
  height: number,
  gap: number,
) {
  const pages: Placement[][] = [];
  let placements: Placement[] = [];
  let y = 0;
  let id = 0;
  const finishPage = () => {
    if (placements.length) pages.push(placements);
    placements = [];
    y = 0;
  };

  for (const group of groups) {
    const size = idSizes[group.sizeKey];
    const availableColumns = Math.max(
      1,
      Math.floor((width + gap) / (size.w + gap)),
    );
    const columns = Math.max(1, Math.min(group.columns, availableColumns));
    let remaining = group.count;

    while (remaining > 0) {
      if (y + size.h > height + 0.01 && placements.length) {
        finishPage();
      }

      const rowCount = Math.min(columns, remaining);
      const rowWidth = rowCount * size.w + (rowCount - 1) * gap;
      const startX = Math.max(0, (width - rowWidth) / 2);

      for (let column = 0; column < rowCount; column++) {
        placements.push({
          id: `${group.sizeKey}-${id++}`,
          sizeKey: group.sizeKey,
          w: size.w,
          h: size.h,
          x: startX + column * (size.w + gap),
          y,
        });
      }

      remaining -= rowCount;
      y += size.h + gap;
    }
  }

  finishPage();
  return pages;
}

export function IdPhotoEditor({
  initial,
  title = "New ID sheet",
}: {
  initial?: { url: string; name: string };
  title?: string;
}) {
  const [image, setImage] = useState(initial);
  const [paperKey, setPaperKey] = useState<PaperKey>("4r");
  const [packageKey, setPackageKey] = useState<PackageKey>("custom");
  const [idSizeKey, setIdSizeKey] = useState<IdSizeKey>("1x1");
  const [landscape, setLandscape] = useState(false);
  const [gap, setGap] = useState(2);
  const [margin, setMargin] = useState(4);
  const [copies, setCopies] = useState(999);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [exporting, setExporting] = useState(false);
  const localUrl = useRef<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (localUrl.current) URL.revokeObjectURL(localUrl.current);
    },
    [],
  );
  const paper = papers[paperKey];
  const idSize = idSizes[idSizeKey];
  const paperW = landscape ? paper.h : paper.w;
  const paperH = landscape ? paper.w : paper.h;
  const columns = Math.max(
    1,
    Math.floor((paperW - margin * 2 + gap) / (idSize.w + gap)),
  );
  const rows = Math.max(
    1,
    Math.floor((paperH - margin * 2 + gap) / (idSize.h + gap)),
  );
  const capacity = columns * rows;
  const groups = useMemo<PhotoGroup[]>(() => {
    if (packageKey !== "custom") return packages[packageKey].groups;
    return [
      {
        sizeKey: idSizeKey,
        count: Math.min(copies, capacity),
        columns,
      },
    ];
  }, [packageKey, idSizeKey, copies, capacity, columns]);
  const items = useMemo<PhotoItem[]>(() => {
    let id = 0;
    return groups.flatMap((group) =>
      Array.from({ length: group.count }, () => {
        const size = idSizes[group.sizeKey];
        return {
          id: `${group.sizeKey}-${id++}`,
          sizeKey: group.sizeKey,
          w: size.w,
          h: size.h,
        };
      }),
    );
  }, [groups]);
  const packedPages = useMemo(
    () =>
      packPhotoGroups(
        groups,
        Math.max(1, paperW - margin * 2),
        Math.max(1, paperH - margin * 2),
        gap,
      ),
    [groups, paperW, paperH, margin, gap],
  );
  const selectPackage = (key: PackageKey) => {
    setPackageKey(key);
    if (key !== "custom") {
      setPaperKey("5r");
      setLandscape(false);
      setGap(0);
      setMargin(0);
    }
  };

  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (localUrl.current) URL.revokeObjectURL(localUrl.current);
    const url = URL.createObjectURL(file);
    localUrl.current = url;
    setImage({ url, name: file.name });
    event.target.value = "";
  };
  const resetCrop = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };
  const downloadPdf = async () => {
    if (!image || exporting) return;
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const orientation = paperW > paperH ? "landscape" : "portrait";
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: [paperW, paperH],
        compress: true,
      });
      const rendered = new Map<IdSizeKey, string>();
      for (const sizeKey of [...new Set(items.map((item) => item.sizeKey))]) {
        const size = idSizes[sizeKey];
        rendered.set(
          sizeKey,
          await renderImageForPdf(image.url, size.w / size.h, {
            fit: "cover",
            zoom,
            offsetX,
            offsetY,
          }),
        );
      }
      for (let pageIndex = 0; pageIndex < packedPages.length; pageIndex++) {
        if (pageIndex > 0) pdf.addPage([paperW, paperH], orientation);
        for (const item of packedPages[pageIndex]) {
          const x = margin + item.x,
            y = margin + item.y;
          pdf.addImage(
            rendered.get(item.sizeKey)!,
            "JPEG",
            x,
            y,
            item.w,
            item.h,
            undefined,
            "FAST",
          );
          pdf.setDrawColor(190);
          pdf.setLineWidth(0.15);
          pdf.rect(x, y, item.w, item.h);
        }
      }
      pdf.save(
        safePdfName(
          `${title}-${paperKey}-${packageKey === "custom" ? idSizeKey : packageKey}`,
        ),
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "The PDF could not be created.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="id-studio">
      <style>{`@page{size:${paperW}mm ${paperH}mm;margin:0}@media print{.id-sheet{width:${paperW}mm!important;height:${paperH}mm!important}}`}</style>
      <header className="studio-head id-head">
        <div className="studio-crumb">
          <Link href="/admin/entries">
            <ArrowLeft size={15} />
            <span>Entries</span>
          </Link>
          <span>/</span>
          <strong>{title}</strong>
        </div>
        <div className="studio-head-actions">
          <button
            className="pill"
            onClick={downloadPdf}
            disabled={!image || exporting}
            aria-label="Download ID sheet as PDF"
            title="Download ID sheet as PDF"
          >
            {exporting ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <FileDown size={17} />
            )}
            <span>{exporting ? "Creating PDF…" : "Download PDF"}</span>
          </button>
          <button
            className="pill primary"
            onClick={() => window.print()}
            disabled={!image}
            aria-label="Print ID sheet"
            title="Print ID sheet"
          >
            <Printer size={17} />
            <span>Print sheet</span>
          </button>
        </div>
      </header>
      <div className="id-body">
        <aside className="id-controls">
          <section>
            <div className="id-section-title">
              <span>01</span>
              <div>
                <strong>Portrait</strong>
                <small>Use a clear, front-facing photo</small>
              </div>
            </div>
            <button
              className="id-upload"
              onClick={() => input.current?.click()}
            >
              {image ? (
                <img src={image.url} alt="Selected ID portrait" />
              ) : (
                <Upload size={24} />
              )}
              <span>{image ? "Change photo" : "Choose photo"}</span>
            </button>
            <input
              hidden
              ref={input}
              type="file"
              accept="image/*"
              onChange={choose}
            />
          </section>
          <section>
            <div className="id-section-title">
              <span>02</span>
              <div>
                <strong>Paper size</strong>
                <small>Choose the photo paper in your printer</small>
              </div>
            </div>
            <div className="paper-options">
              {(
                Object.entries(papers) as [
                  PaperKey,
                  (typeof papers)[PaperKey],
                ][]
              ).map(([key, item]) => (
                <button
                  className={paperKey === key ? "active" : ""}
                  onClick={() => setPaperKey(key)}
                  key={key}
                >
                  <b>{item.label}</b>
                  <small>{item.detail}</small>
                </button>
              ))}
            </div>
            <div className="studio-seg id-orientation">
              <button
                className={!landscape ? "on" : ""}
                onClick={() => setLandscape(false)}
              >
                Portrait
              </button>
              <button
                className={landscape ? "on" : ""}
                onClick={() => setLandscape(true)}
              >
                Landscape
              </button>
            </div>
          </section>
          <section>
            <div className="id-section-title">
              <span>03</span>
              <div>
                <strong>Package & copies</strong>
                <small>Choose one size or a ready-made combination</small>
              </div>
            </div>
            <div className="package-options">
              <button
                className={packageKey === "custom" ? "active" : ""}
                onClick={() => selectPackage("custom")}
              >
                <b>Single size</b>
                <small>Choose size and quantity</small>
              </button>
              {(
                Object.entries(packages) as [
                  Exclude<PackageKey, "custom">,
                  (typeof packages)[Exclude<PackageKey, "custom">],
                ][]
              ).map(([key, item]) => (
                <button
                  className={packageKey === key ? "active" : ""}
                  onClick={() => selectPackage(key)}
                  key={key}
                >
                  <b>{item.label}</b>
                  <small>{item.detail}</small>
                </button>
              ))}
            </div>
            {packageKey === "custom" ? (
              <>
                <div className="id-size-options">
                  {(
                    Object.entries(idSizes) as [
                      IdSizeKey,
                      (typeof idSizes)[IdSizeKey],
                    ][]
                  ).map(([key, item]) => (
                    <button
                      className={idSizeKey === key ? "active" : ""}
                      onClick={() => setIdSizeKey(key)}
                      key={key}
                    >
                      <b>{item.label}</b>
                      <small>{item.detail}</small>
                    </button>
                  ))}
                </div>
                <label className="id-number">
                  Copies{" "}
                  <span>
                    {items.length} / {capacity} fit
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={capacity}
                    value={Math.min(copies, capacity)}
                    onChange={(event) =>
                      setCopies(
                        Math.max(
                          1,
                          Math.min(capacity, +event.target.value || 1),
                        ),
                      )
                    }
                  />
                </label>
              </>
            ) : (
              <div className="package-summary">
                <b>{packages[packageKey].label}</b>
                <span>{packages[packageKey].detail}</span>
                <small>
                  {packedPages.length} sheet
                  {packedPages.length === 1 ? "" : "s"} on {paper.label}
                </small>
              </div>
            )}
          </section>
          <section>
            <div className="id-section-title">
              <span>04</span>
              <div>
                <strong>Crop & spacing</strong>
                <small>Center the face inside every copy</small>
              </div>
            </div>
            <label>
              Zoom <b>{zoom.toFixed(2)}×</b>
              <input
                type="range"
                min="1"
                max="2.5"
                step=".05"
                value={zoom}
                onChange={(event) => setZoom(+event.target.value)}
              />
            </label>
            <label>
              Horizontal <b>{offsetX}%</b>
              <input
                type="range"
                min="-35"
                max="35"
                value={offsetX}
                onChange={(event) => setOffsetX(+event.target.value)}
              />
            </label>
            <label>
              Vertical <b>{offsetY}%</b>
              <input
                type="range"
                min="-35"
                max="35"
                value={offsetY}
                onChange={(event) => setOffsetY(+event.target.value)}
              />
            </label>
            <div className="id-mini-fields">
              <label>
                Gap
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={gap}
                  onChange={(event) =>
                    setGap(Math.max(0, +event.target.value || 0))
                  }
                />
              </label>
              <label>
                Margin
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={margin}
                  onChange={(event) =>
                    setMargin(Math.max(0, +event.target.value || 0))
                  }
                />
              </label>
            </div>
            <button className="id-reset" onClick={resetCrop}>
              <RotateCcw size={13} />
              Reset crop
            </button>
          </section>
        </aside>
        <main className="id-canvas">
          {image ? (
            <div className="id-preview-wrap">
              <div className="id-preview-label">
                <span>
                  {paper.label} · {paperW} × {paperH} mm
                </span>
                <b>
                  {items.length} photos · {packedPages.length} sheet
                  {packedPages.length === 1 ? "" : "s"}
                </b>
              </div>
              {packedPages.map((page, pageIndex) => (
                <div className="id-sheet-wrap" key={pageIndex}>
                  <span>
                    Sheet {pageIndex + 1} of {packedPages.length}
                  </span>
                  <div
                    className="id-sheet"
                    style={{
                      aspectRatio: `${paperW}/${paperH}`,
                      width: landscape ? "min(100%,720px)" : "min(100%,520px)",
                    }}
                  >
                    {page.map((item) => (
                      <div
                        className="id-photo"
                        style={{
                          position: "absolute",
                          left: `${((margin + item.x) / paperW) * 100}%`,
                          top: `${((margin + item.y) / paperH) * 100}%`,
                          width: `${(item.w / paperW) * 100}%`,
                          height: `${(item.h / paperH) * 100}%`,
                        }}
                        key={item.id}
                      >
                        <img
                          src={image.url}
                          alt=""
                          style={{
                            transform: `translate(${offsetX}%,${offsetY}%) scale(${zoom})`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="studio-empty">
              <ImagePlus size={46} />
              <h2 className="display">Add an ID portrait</h2>
              <p>
                Choose one photo, then select 3R, 4R, or 5R paper to build a
                ready-to-print sheet.
              </p>
              <button
                className="pill primary"
                onClick={() => input.current?.click()}
              >
                <Upload size={16} />
                Choose photo
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
