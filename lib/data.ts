import "server-only";
import { createAdminClient } from "./supabase/admin";
import type { Submission, SubmissionFile } from "./types";

export async function getSubmissions(limit = 100) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*, submission_files(*)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Submission[];
}

export async function getSubmissionsWithPreviews(limit = 100) {
  const submissions = await getSubmissions(limit);
  const previewFiles = submissions
    .map((submission) =>
      (submission.submission_files ?? []).find((file) =>
        file.mime_type.startsWith("image/"),
      ),
    )
    .filter((file): file is SubmissionFile => Boolean(file));

  if (!previewFiles.length) return submissions;

  const supabase = createAdminClient();
  const { data: signed, error } = await supabase.storage
    .from("print-files")
    .createSignedUrls(
      previewFiles.map((file) => file.storage_path),
      60 * 60,
    );
  if (error) return submissions;

  const urls = new Map(
    previewFiles.map((file, index) => [
      file.storage_path,
      signed[index]?.signedUrl ?? undefined,
    ]),
  );
  return submissions.map((submission) => ({
    ...submission,
    submission_files: (submission.submission_files ?? []).map((file) => ({
      ...file,
      signed_url: urls.get(file.storage_path),
    })),
  }));
}
export async function getSubmission(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*, submission_files(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  const submission = data as Submission;
  const files = submission.submission_files ?? [];
  if (files.length) {
    const { data: signed, error: signedError } = await supabase.storage
      .from("print-files")
      .createSignedUrls(
        files.map((file) => file.storage_path),
        60 * 60,
      );
    if (!signedError)
      submission.submission_files = files.map((file, index) => ({
        ...file,
        signed_url: signed[index]?.signedUrl ?? undefined,
      }));
  }
  return submission;
}
export async function getDashboardData() {
  const submissions = await getSubmissions(6);
  const supabase = createAdminClient();
  const [{ count: total }, { count: pending }, { data: fileRows }] =
    await Promise.all([
      supabase.from("submissions").select("id", { count: "exact", head: true }),
      supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase.from("submission_files").select("byte_size"),
    ]);
  const used = (fileRows ?? ([] as Pick<SubmissionFile, "byte_size">[])).reduce(
    (sum, row) => sum + Number(row.byte_size),
    0,
  );
  return { submissions, total: total ?? 0, pending: pending ?? 0, used };
}
