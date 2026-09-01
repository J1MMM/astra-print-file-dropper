import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(request: Request) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.submissionIds)
    ? [
        ...new Set(
          body.submissionIds.filter((id: unknown) => typeof id === "string"),
        ),
      ].slice(0, 100)
    : [];
  if (body?.confirmation !== "DELETE" || !ids.length)
    return NextResponse.json(
      { error: "Select completed jobs and type DELETE to confirm." },
      { status: 400 },
    );

  const supabase = createAdminClient();
  const { data: jobs, error: readError } = await supabase
    .from("submissions")
    .select("id, status, submission_files(storage_path, byte_size)")
    .in("id", ids);
  if (readError)
    return NextResponse.json({ error: readError.message }, { status: 500 });
  if (
    !jobs ||
    jobs.length !== ids.length ||
    jobs.some((job) => job.status !== "completed")
  )
    return NextResponse.json(
      { error: "Cleanup is limited to completed jobs." },
      { status: 409 },
    );

  const files = jobs.flatMap((job) => job.submission_files ?? []);
  const paths = files.map((file) => file.storage_path);
  if (paths.length) {
    const { error: storageError } = await supabase.storage
      .from("print-files")
      .remove(paths);
    if (storageError)
      return NextResponse.json(
        { error: "Files could not be removed; no job records were deleted." },
        { status: 500 },
      );
  }
  const { error: deleteError } = await supabase
    .from("submissions")
    .delete()
    .in("id", ids)
    .eq("status", "completed");
  if (deleteError)
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  const bytes = files.reduce((sum, file) => sum + Number(file.byte_size), 0);
  return NextResponse.json({
    deletedJobs: ids.length,
    deletedFiles: files.length,
    bytes,
  });
}
