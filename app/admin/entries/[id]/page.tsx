/* eslint-disable @next/next/no-img-element -- private previews use expiring signed URLs */
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  File,
  LayoutGrid,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";
import { StatusControl } from "@/components/status-control";
import { getSubmission } from "@/lib/data";
import { formatBytes, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EntryPage({
  params,
}: PageProps<"/admin/entries/[id]">) {
  const { id } = await params;
  const entry = await getSubmission(id);
  if (!entry) notFound();

  return (
    <>
      <header className="admin-head">
        <div>
          <Link className="nav-link" href="/admin/entries">
            <ArrowLeft size={14} /> Back to entries
          </Link>
          <h1 className="display">{entry.customer_name || "Guest customer"}</h1>
        </div>
        <Link className="pill primary" href={`/admin/layout/${entry.id}`}>
          <LayoutGrid size={17} />
          Open in layout studio
        </Link>
      </header>
      <div className="detail-grid">
        <section className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">
            <h2 className="display">Files</h2>
            <span className={`status ${entry.status}`}>{entry.status}</span>
          </div>
          <div className="detail-files">
            {entry.submission_files?.map((file) => (
              <article className="detail-file" key={file.id}>
                <a
                  className={`file-visual ${file.mime_type.startsWith("image/") ? "image" : "document"}`}
                  href={file.signed_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Preview ${file.file_name}`}
                >
                  {file.mime_type.startsWith("image/") && file.signed_url ? (
                    <img
                      src={file.signed_url}
                      alt={`Preview of ${file.file_name}`}
                    />
                  ) : (
                    <>
                      <File size={24} />
                      <small>
                        {file.file_name
                          .split(".")
                          .pop()
                          ?.slice(0, 5)
                          .toUpperCase()}
                      </small>
                    </>
                  )}
                </a>
                <div className="file-copy">
                  <strong>{file.file_name}</strong>
                  <small>
                    {file.mime_type} · {formatBytes(file.byte_size)}
                  </small>
                  <span>
                    {file.mime_type.startsWith("image/")
                      ? "Image preview available"
                      : "Open the original file to preview"}
                  </span>
                </div>
                <div className="file-actions">
                  {file.signed_url && (
                    <>
                      <a
                        href={file.signed_url}
                        target="_blank"
                        rel="noreferrer"
                        title="Open preview"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <a
                        href={`${file.signed_url}&download=${encodeURIComponent(file.file_name)}`}
                        title="Download original"
                      >
                        <Download size={15} />
                      </a>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
        <aside className="panel" style={{ marginTop: 0 }}>
          <div className="panel-title">
            <h2 className="display">Job details</h2>
          </div>
          <div className="info-list">
            <div>
              <small>Customer</small>
              <span>
                <UserRound size={13} /> {entry.customer_name || "Not provided"}
              </span>
            </div>
            <div>
              <small>Received</small>
              <span>{formatDate(entry.created_at)}</span>
            </div>
            <div>
              <small>Print notes</small>
              <span className="note-box">
                {entry.notes || "No instructions were included."}
              </span>
            </div>
          </div>
          <StatusControl id={entry.id} initial={entry.status} />
        </aside>
      </div>
    </>
  );
}
