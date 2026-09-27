// compactrun.js：按收键预算收键并留账，收尾时把账收完再切块
import { blockPrefix } from "./lcp.js";

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function validSize(size) {
  return Number.isInteger(size) && size > 0;
}

function cloneState(state) {
  const source = state || {};
  return {
    keys: Array.isArray(source.keys) ? source.keys.slice() : [],
    ledger: Array.isArray(source.ledger) ? source.ledger.slice() : [],
    applied: Array.isArray(source.applied) ? source.applied.slice() : []
  };
}

export function buildBlocks(keys, size) {
  const sorted = keys.slice().sort();
  const blocks = [];
  for (let start = 0; start < sorted.length; start += size) {
    const rows = sorted.slice(start, start + size);
    const prefix = blockPrefix(rows);
    blocks.push([prefix, rows.map(function (row) { return row.slice(prefix.length); })]);
  }
  return blocks;
}

export function step(spec) {
  if (!validSize(spec.block_size)) {
    fail(spec.size_error_code || "E_BAD_SIZE", "block_size must be a positive integer");
  }
  const source = spec.state || {};
  const keys = Array.isArray(source.keys) ? source.keys.slice() : [];
  const ledger = Array.isArray(source.ledger) ? source.ledger.slice() : [];
  const applied = Array.isArray(source.applied) ? source.applied.slice() : [];
  const events = Array.isArray(spec.events) ? spec.events : [];

  let budget = Number(spec.budget);
  if (!Number.isFinite(budget) || budget < 0) budget = 0;
  budget = Math.floor(budget);

  let collected = 0;
  let judged = 0;

  for (const event of events) {
    if (event === null || typeof event !== "object" || event.kind !== "key"
        || typeof event.name !== "string") {
      fail(spec.event_error_code || "E_BAD_EVENT", "event must be a key event with a string name");
    }
    const seen = applied.indexOf(event.id) !== -1;
    if (seen) continue;
    judged += 1;
    if (event.name === "") {
      fail(spec.key_error_code || "E_BAD_KEY", "key must not be empty");
    }
    if (keys.indexOf(event.name) !== -1 || ledger.indexOf(event.name) !== -1) {
      fail(spec.duplicate_error_code || "E_DUPLICATE_KEY", "key already collected or pending in ledger");
    }
    if (collected < budget) {
      keys.push(event.name);
      collected += 1;
    } else {
      ledger.push(event.name);
    }
    applied.push(event.id);
  }

  return {
    state: { keys: keys, ledger: ledger, applied: applied },
    collected: collected,
    ledger_before: ledger.length,
    ledger: ledger.slice(),
    judged: judged,
    judged_bound: events.length
  };
}

export function close(spec) {
  if (!validSize(spec.block_size)) {
    fail(spec.size_error_code || "E_BAD_SIZE", "block_size must be a positive integer");
  }
  const state = cloneState(spec.state);
  const catchup = state.ledger.length;
  for (const name of state.ledger) state.keys.push(name);
  state.ledger = [];
  return {
    state: state,
    catchup: catchup,
    blocks: buildBlocks(state.keys, spec.block_size)
  };
}
