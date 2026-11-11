"use client";

import { useState } from "react";
import { Copy, Terminal } from "lucide-react";
import styles from "./homepage.module.css";

const command = "npx auditgpt test --ci";

export function CopyCommand() {
  const [status, setStatus] = useState("");
  return (
    <div className={styles.copy}>
      <button type="button" aria-label="Copy AuditGPT CLI command" onClick={async () => {
        try {
          await navigator.clipboard.writeText(command);
          setStatus("Copied");
        } catch {
          setStatus("Select the command to copy it manually");
        }
      }}>
        <Terminal size={15} aria-hidden="true" /> <code>{command}</code><Copy size={14} aria-hidden="true" />
      </button>
      <span role="status">{status}</span>
    </div>
  );
}
