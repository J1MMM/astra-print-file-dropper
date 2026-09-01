"use client";

import {useRef, useState, type ChangeEvent, type DragEvent} from "react";
import {Check, File, FileImage, LoaderCircle, Plus, ShieldCheck, UploadCloud, X} from "lucide-react";

const MAX_FILES = 12;
const MAX_BYTES = 20 * 1024 * 1024;

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (incoming: FileList | null) => {
    setError("");
    const next = [...files, ...Array.from(incoming ?? [])];
    if (next.length > MAX_FILES) return setError(`You can send up to ${MAX_FILES} files at once.`);
    const oversized = next.find((file) => file.size > MAX_BYTES);
    if (oversized) return setError(`${oversized.name} is larger than 20 MB.`);
    setFiles(next);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    add(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    add(event.dataTransfer.files);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!files.length) return;
    setState("sending");
    setError("");
    const data = new FormData(event.currentTarget);
    files.forEach((file) => data.append("files", file));
    try {
      const response = await fetch("/api/submissions", {method: "POST", body: data});
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Upload failed");
      setFiles([]);
      setState("done");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Something went wrong.");
      setState("idle");
    }
  };

  if (state === "done") {
    return <div className="upload-card success-card"><div className="success-icon"><Check size={30} /></div><p className="eyebrow">Files received</p><h2 className="display">You&apos;re in the queue.</h2><p>Your files were sent successfully and are ready to be prepared.</p><button className="pill primary" onClick={() => setState("idle")}>Send another batch</button></div>;
  }

  return (
    <form className="upload-card" onSubmit={submit}>
      <div className="form-heading"><div><p className="step">Upload your files</p><h2 className="display">Drop them here</h2></div><span className="secure"><ShieldCheck size={14} />Private</span></div>
      <div className={`dropzone ${dragging ? "dragging" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => {event.preventDefault(); setDragging(true);}} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        <input ref={inputRef} hidden type="file" multiple accept="image/*,.pdf,.doc,.docx,.ppt,.pptx" onChange={onChange} />
        <div className="upload-icon"><UploadCloud size={27} /></div><strong>Choose files to print</strong><span>Tap here or drag and drop</span><small>Images, PDF, Word, PowerPoint · max 20 MB each</small>
      </div>
      {files.length > 0 && <div className="file-list">{files.map((file, index) => <div className="file-row" key={`${file.name}-${index}`}><span className="file-icon">{file.type.startsWith("image/") ? <FileImage size={17} /> : <File size={17} />}</span><div><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></div><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((items) => items.filter((_, itemIndex) => itemIndex !== index))}><X size={16} /></button></div>)}<button className="add-more" type="button" onClick={() => inputRef.current?.click()}><Plus size={14} />Add more</button></div>}
      <details className="optional-details"><summary>Add name or print notes <span>Optional</span></summary><div className="optional-fields"><div className="field"><label htmlFor="name">Name <span>optional</span></label><input className="input" id="name" name="name" placeholder="Your name" maxLength={80} /></div><div className="field"><label htmlFor="notes">Print notes <span>optional</span></label><textarea className="input" id="notes" name="notes" placeholder="e.g. 2 copies, A4, color, double-sided…" maxLength={800} /></div></div></details>
      {error && <p className="form-error">{error}</p>}
      <button className="pill primary submit" disabled={!files.length || state === "sending"}>{state === "sending" ? <><LoaderCircle className="spin" size={18} />Uploading…</> : <>Send files <UploadCloud size={18} /></>}</button>
      <p className="privacy">No account needed. Your files are stored privately.</p>
    </form>
  );
}
