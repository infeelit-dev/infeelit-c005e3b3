import { useState } from "react";
import { importGuests } from "@/scripts/importGuests";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  linkedinCount: number;
  bioCount: number;
}

export function ImportButton() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleImport = async () => {
    if (
      !confirm(
        "⚠️ ADMIN ONLY — Are you sure you want to import guests?\n\nThis will upsert all guests from the CSV file.",
      )
    ) {
      return;
    }

    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress since the import is fast
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const importResult = await importGuests();
      clearInterval(interval);
      setProgress(100);
      setResult(importResult);
    } catch (error) {
      console.error("Import failed:", error);
      setResult({
        imported: 0,
        skipped: 0,
        errors: [(error as Error).message],
        linkedinCount: 0,
        bioCount: 0,
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        background: "#111",
        border: "1px solid #333",
        borderRadius: "12px",
        padding: "16px",
        maxWidth: "280px",
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "#D85A30",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: "8px",
        }}
      >
        ADMIN ONLY — REMOVE BEFORE LAUNCH
      </div>

      {!importing && !result && (
        <button
          onClick={handleImport}
          style={{
            background: "#D85A30",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            color: "#fff",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            width: "100%",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Import Guests from CSV
        </button>
      )}

      {importing && (
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "#888",
              marginBottom: "8px",
            }}
          >
            Importing... {progress}%
          </div>
          <div
            style={{
              width: "100%",
              height: "4px",
              background: "#2A2A2A",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#D85A30",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {result && !importing && (
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: result.errors.length > 0 ? "#D85A30" : "#4CAF50",
              marginBottom: "8px",
            }}
          >
            {result.errors.length > 0 ? "⚠️ Import completed with errors" : "✅ Import completed"}
          </div>
          <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>Imported: {result.imported}</div>
          <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>Skipped: {result.skipped}</div>
          <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>
            LinkedIn: {result.linkedinCount} found
          </div>
          <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>Luma Bio: {result.bioCount} filled</div>
          {result.errors.length > 0 && (
            <details style={{ fontSize: "10px", color: "#D85A30" }}>
              <summary>{result.errors.length} error(s)</summary>
              {result.errors.slice(0, 5).map((err, i) => (
                <div key={i} style={{ marginTop: "4px", wordBreak: "break-word" }}>
                  • {err}
                </div>
              ))}
            </details>
          )}
          <button
            onClick={() => setResult(null)}
            style={{
              background: "transparent",
              border: "1px solid #333",
              borderRadius: "6px",
              padding: "6px 12px",
              color: "#888",
              fontSize: "10px",
              cursor: "pointer",
              marginTop: "8px",
              width: "100%",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}