/* eslint-disable @next/next/no-img-element -- private previews use expiring signed URLs */
import Link from "next/link";
import { FileText, PackageOpen } from "lucide-react";
import { StorageCleanup } from "@/components/storage-cleanup";
import { getSubmissionsWithPreviews } from "@/lib/data";
import { formatBytes, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EntriesPage() {
  const entries = await getSubmissionsWithPreviews();
  const cleanupEntries = entries
    .filter((entry) => entry.status === "completed")
    .map((entry) => ({
      id: entry.id,
      name: entry.customer_name || "Guest customer",
      createdAt: entry.created_at,
      fileCount: entry.submission_files?.length ?? 0,
      bytes: (entry.submission_files ?? []).reduce(
        (sum, file) => sum + Number(file.byte_size),
        0,
      ),
    }));

  return (
    <>
      <header className="admin-head">
        <div>
          <p className="eyebrow">All submissions</p>
          <h1 className="display">Print entries</h1>
        </div>
        <span className="subtle">{entries.length} total</span>
      </header>
      <section className="panel entries-panel">
        <div className="entry-list">
          {entries.length ? (
            <>
              <div className="entry-row table-head">
                <span>Customer</span>
                <span>Status</span>
                <span>Files</span>
                <span>Received</span>
              </div>
              {entries.map((entry) => {
                const files = entry.submission_files ?? [];
                const bytes = files.reduce(
                  (sum, file) => sum + Number(file.byte_size),
                  0,
                );
                const preview = files.find((file) => file.signed_url);
                const firstFile = files[0];
                return (
                  <Link
                    className="entry-row"
                    href={`/admin/entries/${entry.id}`}
                    key={entry.id}
                  >
                    <div className="entry-person">
                      <span className="entry-preview">
                        {preview ? (
                          <img src={preview.signed_url} alt="" />
                        ) : firstFile ? (
                          <FileText size={20} />
                        ) : (
                          (entry.customer_name ?? "G")[0].toUpperCase()
                        )}
                      </span>
                      <div>
                        <strong>
                          {entry.customer_name || "Guest customer"}
                        </strong>
                        <small>
                          {firstFile?.file_name || entry.id.slice(0, 8)}
                        </small>
                      </div>
                    </div>
                    <span className={`status ${entry.status}`}>
                      {entry.status}
                    </span>
                    <span className="entry-meta">
                      {files.length} · {formatBytes(bytes)}
                    </span>
                    <span className="entry-meta">
                      {formatDate(entry.created_at)}
                    </span>
                  </Link>
                );
              })}
            </>
          ) : (
            <div className="empty-panel">
              <PackageOpen size={34} />
              <strong>Your queue is clear</strong>
              <p>New customer uploads will appear here.</p>
            </div>
          )}
        </div>
      </section>
      <StorageCleanup entries={cleanupEntries} />
    </>
  );
}
