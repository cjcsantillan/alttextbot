"use client";

import { useCallback, useRef, useState } from "react";
import { CopyButton } from "./CopyButton";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export function Uploader() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState({ kind: "idle" }); // idle | loading | error
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  const selectFile = useCallback((candidate) => {
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setStatus({ kind: "error", message: `Unsupported file type: ${candidate.type || "unknown"}` });
      return;
    }
    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      setStatus({ kind: "error", message: "Image exceeds the 5 MB limit." });
      return;
    }
    setFile(candidate);
    setPreviewUrl(URL.createObjectURL(candidate));
    setResult(null);
    setStatus({ kind: "idle" });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;

    setStatus({ kind: "loading" });
    const body = new FormData();
    body.append("image", file);

    try {
      const res = await fetch("/api/alt-text", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed.");

      setResult(data);
      setStatus({ kind: "idle" });
      setHistory((prev) => [
        { id: crypto.randomUUID(), previewUrl, ...data, at: new Date() },
        ...prev,
      ].slice(0, 6));
    } catch (err) {
      setStatus({ kind: "error", message: err.message });
    }
  }

  return (
    <>
      <section className="workspace">
        <form onSubmit={handleSubmit}>
          <div
            className={`dropzone${isDragging ? " dragover" : ""}`}
            role="button"
            tabIndex={0}
            aria-label="Choose or drop an image"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              selectFile(e.dataTransfer.files[0]);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              hidden
              accept={ACCEPTED_TYPES.join(",")}
              onChange={(e) => selectFile(e.target.files[0])}
            />

            {previewUrl ? (
              <div className="dropzone-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="" />
                <div className="preview-overlay">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreviewUrl(null);
                      setResult(null);
                    }}
                  >
                    Replace image
                  </button>
                </div>
              </div>
            ) : (
              <div className="dropzone-empty">
                <DropzoneIcon />
                <p className="dropzone-title">Drop an image here, or click to choose one</p>
                <p className="dropzone-hint">PNG, JPEG, WebP or GIF — up to 5 MB</p>
              </div>
            )}
          </div>

          <div className="actions">
            <button type="submit" className="primary" disabled={!file || status.kind === "loading"}>
              <span className="btn-label">
                {status.kind === "loading" ? "Generating…" : "Generate alt text"}
              </span>
              {status.kind === "loading" && <span className="btn-spinner" aria-hidden="true" />}
            </button>
            <p className={`status${status.kind === "error" ? " error" : ""}`} role="status">
              {status.kind === "error" ? status.message : ""}
            </p>
          </div>
        </form>

        {result && (
          <section className="result-panel" aria-live="polite">
            <div className="result-header">
              <span className="section-label">Output</span>
            </div>
            <div className="field">
              <h3>
                <span>Alt text</span>
                <CopyButton text={result.altText} />
              </h3>
              <p>{result.altText}</p>
            </div>
            <div className="field">
              <h3>
                <span>Caption</span>
                <CopyButton text={result.caption} />
              </h3>
              <p>{result.caption}</p>
            </div>
          </section>
        )}
      </section>

      {history.length > 0 && (
        <section className="history">
          <span className="section-label">Recent generations</span>
          <div className="history-grid">
            {history.map((item) => (
              <figure key={item.id} className="history-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt={item.altText} />
                <figcaption>{item.altText}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function DropzoneIcon() {
  return (
    <svg className="dropzone-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="20" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M10 33l9.5-9.5a2.5 2.5 0 0 1 3.5 0L34 34"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
