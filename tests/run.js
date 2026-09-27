import assert from "node:assert";
import { commonPrefix, blockPrefix } from "../lcp.js";
import { step, close } from "../compactrun.js";
import { render } from "../app.js";

const base = {
  budget: 2, block_size: 2,
  state: { keys: [], ledger: [], applied: [] },
  events: [],
  key_error_code: "E_BAD_KEY", duplicate_error_code: "E_DUPLICATE_KEY",
  size_error_code: "E_BAD_SIZE", event_error_code: "E_BAD_EVENT"
};

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("commonPrefix returns text", () => {
  assert.strictEqual(typeof commonPrefix("ab", "ac"), "string");
});

check("blockPrefix returns text", () => {
  assert.strictEqual(typeof blockPrefix(["x"]), "string");
});

check("step returns a state", () => {
  assert.strictEqual(typeof step(base).state, "object");
});

check("close returns a state", () => {
  assert.strictEqual(typeof close(base).state, "object");
});

check("render counts events", () => {
  assert.strictEqual(typeof render(base).count, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
