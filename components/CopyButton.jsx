"use client";

import { useState } from "react";

export function CopyButton({ text }) {
  const [label, setLabel] = useState("copy");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setLabel("copied ✓");
    } catch {
      setLabel("copy failed");
    }
    setTimeout(() => setLabel("copy"), 1500);
  }

  return (
    <button className="copy" type="button" onClick={handleCopy}>
      {label}
    </button>
  );
}
