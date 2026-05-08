import { SectionLabel } from "./ordersTab.constants";
import { ProdigiAssetPreviewPanel } from "./ordersTab.prodigiAtoms";
import { compactJson } from "./ordersTab.prodigiUtils";
import type { ProdigiFlow, ProdigiRecord } from "./ordersTab.types";

export function ProdigiEventsPanel({
  flow,
  flowItems,
}: {
  flow: ProdigiFlow;
  flowItems: ProdigiRecord[];
}) {
  return (
    <div className="space-y-2">
      <SectionLabel text="Gate Details And API Events" />
      <ProdigiAssetPreviewPanel flow={flow} flowItems={flowItems} />
      {(flow.gates ?? []).map((gate) => (
        <details
          key={String(gate.id)}
          open={gate.status === "failed" || gate.status === "blocked"}
          className="rounded-lg border border-[#31323E]/8 bg-white p-3 text-xs"
        >
          <summary className="cursor-pointer font-bold text-[#31323E]">
            {String(gate.gate)}:{" "}
            <span
              className={
                gate.status === "failed" || gate.status === "blocked"
                  ? "text-rose-600"
                  : "text-emerald-700"
              }
            >
              {String(gate.status)}
            </span>
          </summary>
          {gate.error ? (
            <p className="mt-2 text-rose-700">{String(gate.error)}</p>
          ) : null}
          {compactJson({ measured: gate.measured, expected: gate.expected }) ? (
            <pre className="mt-2 max-h-44 overflow-auto rounded-md bg-[#F7F7F5] p-3 text-[10px] leading-relaxed text-[#31323E]/65">
              {compactJson({
                measured: gate.measured,
                expected: gate.expected,
              })}
            </pre>
          ) : null}
        </details>
      ))}
      {(flow.events ?? []).map((event) => (
        <details
          key={String(event.id)}
          className="rounded-lg border border-[#31323E]/8 bg-white p-3 text-xs"
        >
          <summary className="cursor-pointer font-bold text-[#31323E]">
            {String(event.event_type)}/{String(event.stage)}:{" "}
            {String(event.status)}
          </summary>
          {event.error ? (
            <p className="mt-2 text-rose-700">{String(event.error)}</p>
          ) : null}
          {compactJson(
            event.response_payload || event.request_payload || event.metadata,
          ) ? (
            <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-[#121212] p-3 text-[10px] leading-relaxed text-emerald-300">
              {compactJson(
                event.response_payload ||
                  event.request_payload ||
                  event.metadata,
              )}
            </pre>
          ) : null}
        </details>
      ))}
    </div>
  );
}
