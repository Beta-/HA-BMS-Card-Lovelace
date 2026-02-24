import { JkBmsReactorCard } from "./card.js";

if (!customElements.get("jk-bms-reactor-card")) {
  customElements.define("jk-bms-reactor-card", JkBmsReactorCard);
}

// Expose card info so Lovelace's card-picker can display metadata.
(window as Window & typeof globalThis & {
  customCards?: Array<{ type: string; name: string; description: string }>;
}).customCards = (window as Window & typeof globalThis & {
  customCards?: Array<{ type: string; name: string; description: string }>;
}).customCards ?? [];

(window as Window & typeof globalThis & {
  customCards?: Array<{ type: string; name: string; description: string }>;
}).customCards!.push({
  type: "jk-bms-reactor-card",
  name: "JK BMS Reactor Card",
  description: "Reactor-style visualisation of a JK BMS 16S battery pack.",
});
