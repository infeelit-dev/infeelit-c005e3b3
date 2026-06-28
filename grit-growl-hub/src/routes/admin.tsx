import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { callDeepSeek } from "@/lib/deepseek";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let pdfjsPromise: Promise<any> | null = null;
function loadPdfJs(): Promise<any> {
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      return resolve((window as any).pdfjsLib);
    }
    const s = document.createElement("script");
    s.src = PDFJS_URL;
    s.onload = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      resolve(lib);
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return pdfjsPromise;
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await loadPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(" ") + "\n";
  }
  return text;
}

function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyMatch(extractedName: string, attendees: any[]): any | null {
  const target = normalize(extractedName);
  if (!target) return null;
  const targetTokens = new Set(target.split(" ").filter((t) => t.length > 1));

  let best: { att: any; score: number } | null = null;
  for (const att of attendees) {
    const candidates = [att.full_name, `${att.first_name ?? ""}`].filter(Boolean);
    for (const c of candidates) {
      const n = normalize(c);
      if (!n) continue;
      if (n === target) return att;
      const tokens = new Set(n.split(" ").filter((t) => t.length > 1));
      let overlap = 0;
      tokens.forEach((t) => {
        if (targetTokens.has(t)) overlap++;
      });
      const score = overlap / Math.max(tokens.size, targetTokens.size, 1);
      if (score >= 0.5 && (!best || score > best.score)) {
        best = { att, score };
      }
    }
  }
  return best?.att ?? null;
}

function AdminPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const log = (msg: string) =>
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  async function processAll() {
    if (!files.length || running) return;
    setRunning(true);
    setLogs([]);
    log(`Loading attendees…`);

    const { data: listRes, error: listErr } = await supabase.functions.invoke(
      "manage-attendee",
      { body: { action: "list-all" } },
    );
    if (listErr || !listRes?.success) {
      log(`✗ Failed to load attendees: ${listErr?.message || listRes?.error}`);
      setRunning(false);
      return;
    }
    const attendees = listRes.data as any[];
    log(`Loaded ${attendees.length} attendees.`);

    let matched = 0;
    let unmatched = 0;

    for (const file of files) {
      log(`— Processing ${file.name}`);
      try {
        const text = await extractPdfText(file);
        if (!text.trim()) {
          log(`✗ Empty PDF: ${file.name}`);
          unmatched++;
          continue;
        }

        const ds = await callDeepSeek({
          messages: [
            {
              role: "system",
              content:
                "Extract from this LinkedIn profile text: full name, current role, company, industry, key experiences (max 3), top skills (max 5). Return as JSON: {name, role, company, industry, summary}. Reply with JSON only, no markdown.",
            },
            { role: "user", content: text.slice(0, 12000) },
          ],
          temperature: 0.2,
        });

        const raw = (ds.choices?.[0]?.message?.content ?? "")
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        let parsed: any;
        try {
          parsed = JSON.parse(raw);
        } catch {
          log(`✗ Parse error for ${file.name}`);
          unmatched++;
          continue;
        }

        const name = parsed.name || "";
        const summaryParts = [
          parsed.role && `Role: ${parsed.role}`,
          parsed.company && `Company: ${parsed.company}`,
          parsed.industry && `Industry: ${parsed.industry}`,
          parsed.summary && `Summary: ${parsed.summary}`,
        ].filter(Boolean);
        const summary = summaryParts.join("\n");

        const match = fuzzyMatch(name, attendees);
        if (!match) {
          log(`✗ No match: ${name || file.name}`);
          unmatched++;
          continue;
        }

        const { error: upErr } = await supabase.functions.invoke("manage-attendee", {
          body: {
            action: "update-linkedin-summary",
            id: match.id,
            linkedin_summary: summary,
          },
        });
        if (upErr) {
          log(`✗ Update failed for ${name}: ${upErr.message}`);
          unmatched++;
          continue;
        }

        matched++;
        log(`✓ Matched: ${name} → ${match.email}`);
      } catch (e: any) {
        console.error(e);
        log(`✗ Error on ${file.name}: ${e?.message || e}`);
        unmatched++;
      }
    }

    log(`Processed ${files.length} PDFs — ${matched} matched — ${unmatched} unmatched`);
    setRunning(false);
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-medium mb-8">Admin — LinkedIn PDF Processing</h1>

        <div className="space-y-4">
          <label
            style={{
              display: "inline-block",
              background: "#D85A30",
              color: "#fff",
              padding: "14px 24px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            Select PDF Files
            <input
              type="file"
              accept=".pdf"
              multiple
              style={{ display: "none" }}
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>

          {files.length > 0 && (
            <p className="text-sm text-[var(--text-secondary)]">
              {files.length} file(s) selected
            </p>
          )}

          <button
            onClick={processAll}
            disabled={!files.length || running}
            className="h-11 px-6 rounded-[12px] bg-[var(--accent-color)] text-white font-semibold disabled:opacity-40"
          >
            {running ? "Processing…" : "Process PDFs"}
          </button>
        </div>

        <div className="mt-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] p-4 font-mono text-xs h-[480px] overflow-auto">
          {logs.length === 0 ? (
            <p className="text-[var(--text-hint)]">Log will appear here…</p>
          ) : (
            logs.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap">
                {l}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}