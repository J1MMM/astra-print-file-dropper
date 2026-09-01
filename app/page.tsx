import {Clock3, LockKeyhole} from "lucide-react";
import {Brand} from "@/components/brand";
import {UploadForm} from "@/components/upload-form";
import "./upload.css";

export default function Home() {
  return (
    <main className="public-page">
      <header className="shell topbar customer-topbar"><Brand /></header>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">Easy file drop-off</p>
          <h1 className="display">Send it.<br /><em>We&apos;ll print it.</em></h1>
          <p className="lede">Upload your documents or photos in seconds. No sign-up and no confusing forms—just choose your files and send.</p>
          <div className="trust-row">
            <span><LockKeyhole size={16} />Private &amp; secure</span>
            <span><Clock3 size={16} />Takes under a minute</span>
          </div>
        </div>
        <UploadForm />
      </section>
      <section className="how-section">
        <div className="shell how-wrap">
          <div><p className="eyebrow">That&apos;s all there is to it</p><h2 className="display">Three small steps.<br />One less errand.</h2></div>
          <ol>
            <li><b>1</b><span><strong>Choose your files</strong><small>Photos, PDFs, and office documents</small></span></li>
            <li><b>2</b><span><strong>Add details if needed</strong><small>Name and print notes are optional</small></span></li>
            <li><b>3</b><span><strong>Send them over</strong><small>Your files enter the print queue</small></span></li>
          </ol>
        </div>
      </section>
      <footer className="shell public-footer"><Brand /><p>Your files stay private and secure.</p></footer>
    </main>
  );
}
