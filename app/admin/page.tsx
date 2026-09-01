import Link from "next/link";
import {
  ArrowUpRight,
  Database,
  HardDrive,
  Inbox,
  PackageOpen,
} from "lucide-react";
import { getDashboardData } from "@/lib/data";
import { formatBytes, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const { submissions, total, pending, used } = await getDashboardData();
  const quota = Number(
    process.env.NEXT_PUBLIC_STORAGE_QUOTA_BYTES ?? 1073741824,
  );
  const remaining = Math.max(0, quota - used),
    percent = Math.min(100, (used / quota) * 100);
  return (
    <>
      <header className="admin-head">
        <div>
          <p className="eyebrow">Print desk</p>
          <h1 className="display">Good day, admin.</h1>
        </div>
        <Link className="pill primary" href="/admin/entries">
          Open queue <ArrowUpRight size={17} />
        </Link>
      </header>
      <section className="metric-grid">
        <article className="metric">
          <div className="metric-top">
            <small>Total entries</small>
            <span>
              <Database size={18} />
            </span>
          </div>
          <strong>{total}</strong>
          <small>All print submissions</small>
        </article>
        <article className="metric">
          <div className="metric-top">
            <small>Waiting</small>
            <span>
              <Inbox size={18} />
            </span>
          </div>
          <strong>{pending}</strong>
          <small>Needs your attention</small>
        </article>
        <article className="metric">
          <div className="metric-top">
            <small>Storage remaining</small>
            <span>
              <HardDrive size={18} />
            </span>
          </div>
          <strong>{formatBytes(remaining)}</strong>
          <small>
            {formatBytes(used)} of {formatBytes(quota)} used
          </small>
          <div className="progress">
            <span style={{ width: `${percent}%` }} />
          </div>
        </article>
      </section>
      <section className="panel">
        <div className="panel-title">
          <h2 className="display">Recent entries</h2>
          <Link href="/admin/entries">View all →</Link>
        </div>
        {submissions.length ? (
          <div className="entry-list">
            {submissions.map((entry) => (
              <Link
                className="entry-row"
                href={`/admin/entries/${entry.id}`}
                key={entry.id}
              >
                <div className="entry-person">
                  <span className="entry-avatar">
                    {(entry.customer_name ?? "G").slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <strong>{entry.customer_name || "Guest customer"}</strong>
                    <small>
                      {entry.submission_files?.[0]?.file_name ||
                        entry.id.slice(0, 8)}
                    </small>
                  </div>
                </div>
                <span className={`status ${entry.status}`}>{entry.status}</span>
                <span className="entry-meta">
                  {entry.submission_files?.length ?? 0} file
                  {entry.submission_files?.length === 1 ? "" : "s"}
                </span>
                <span className="entry-meta">
                  {formatDate(entry.created_at)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <PackageOpen size={34} />
            <strong>No entries yet</strong>
            <p>New uploads will appear here.</p>
          </div>
        )}
      </section>
    </>
  );
}
