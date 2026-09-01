"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  HardDrive,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";
import { formatBytes, formatDate } from "@/lib/format";

type CleanupEntry = {
  id: string;
  name: string;
  createdAt: string;
  fileCount: number;
  bytes: number;
};

export function StorageCleanup({ entries }: { entries: CleanupEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const selectedEntries = useMemo(
    () => entries.filter((entry) => selected.includes(entry.id)),
    [entries, selected],
  );
  const selectedBytes = selectedEntries.reduce(
    (sum, entry) => sum + entry.bytes,
    0,
  );

  const close = () => {
    if (deleting) return;
    setOpen(false);
    setSelected([]);
    setConfirmation("");
    setError("");
  };
  const remove = async () => {
    if (!selected.length || confirmation !== "DELETE") return;
    setDeleting(true);
    setError("");
    const response = await fetch("/api/admin/storage/cleanup", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ submissionIds: selected, confirmation }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Cleanup failed.");
      setDeleting(false);
      return;
    }
    setDeleting(false);
    setOpen(false);
    setSelected([]);
    setConfirmation("");
    setError("");
    router.refresh();
  };

  return (
    <>
      <section className="storage-manage">
        <div className="storage-manage-icon">
          <HardDrive size={20} />
        </div>
        <div>
          <strong>Storage management</strong>
          <p>
            Review and permanently remove completed print jobs you no longer
            need.
          </p>
        </div>
        <button
          className="pill cleanup-review"
          disabled={!entries.length}
          onClick={() => setOpen(true)}
        >
          {entries.length
            ? `Review ${entries.length} completed job${entries.length === 1 ? "" : "s"}`
            : "Nothing to clean"}
        </button>
      </section>
      {open && (
        <div
          className="cleanup-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section
            className="cleanup-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cleanup-title"
          >
            <header>
              <div>
                <span>
                  <AlertTriangle size={19} />
                </span>
                <div>
                  <h2 id="cleanup-title" className="display">
                    Review storage cleanup
                  </h2>
                  <p>
                    Only completed jobs are shown. Deletion cannot be undone.
                  </p>
                </div>
              </div>
              <button aria-label="Close cleanup dialog" onClick={close}>
                <X size={19} />
              </button>
            </header>
            <div className="cleanup-list">
              {entries.map((entry) => (
                <label className="cleanup-entry" key={entry.id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(entry.id)}
                    onChange={(event) =>
                      setSelected((current) =>
                        event.target.checked
                          ? [...current, entry.id]
                          : current.filter((id) => id !== entry.id),
                      )
                    }
                  />
                  <span>
                    <strong>{entry.name}</strong>
                    <small>
                      {formatDate(entry.createdAt)} · {entry.fileCount} file
                      {entry.fileCount === 1 ? "" : "s"}
                    </small>
                  </span>
                  <b>{formatBytes(entry.bytes)}</b>
                </label>
              ))}
            </div>
            <div className="cleanup-confirm">
              <div>
                <strong>{selected.length} selected</strong>
                <span>
                  {formatBytes(selectedBytes)} will be permanently removed
                </span>
              </div>
              <label>
                Type <b>DELETE</b> to confirm
                <input
                  className="input"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                />
              </label>
            </div>
            {error && <p className="form-error">{error}</p>}
            <footer>
              <button className="pill" onClick={close}>
                Cancel
              </button>
              <button
                className="pill cleanup-delete"
                disabled={
                  !selected.length || confirmation !== "DELETE" || deleting
                }
                onClick={remove}
              >
                {deleting ? (
                  <>
                    <LoaderCircle className="spin" size={16} />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Permanently delete
                  </>
                )}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
