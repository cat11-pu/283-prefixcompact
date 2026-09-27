// compactrun.js：按收键预算收键并留账
function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

export function step(spec) {
  const source = spec.state || {};
  const keys = (source.keys || []).slice();
  const ledger = (source.ledger || []).slice();
  const applied = (source.applied || []).slice();
  const events = spec.events || [];
  const sizeCode = spec.size_error_code || "E_BAD_SIZE";
  const eventCode = spec.event_error_code || "E_BAD_EVENT";
  const keyCode = spec.key_error_code || "E_BAD_KEY";
  const duplicateCode = spec.duplicate_error_code || "E_DUPLICATE_KEY";

  if (!Number.isInteger(spec.block_size) || spec.block_size <= 0) {
    fail(sizeCode, "block_size 必须是正整数");
  }
  let remaining = Number.isFinite(spec.budget) ? spec.budget : events.length;
  let collected = 0;
  let judged = 0;
  for (const event of events) {
    judged += 1;
    if (!event || typeof event !== "object" || event.kind !== "key") {
      fail(eventCode, "事件必须是 key 事件");
    }
    const mark = event.id !== undefined ? event.id : event.name;
    if (applied.indexOf(mark) !== -1) {
      continue;
    }
    if (typeof event.name !== "string" || event.name === "") {
      fail(keyCode, "键必须是非空字符串");
    }
    if (keys.indexOf(event.name) !== -1 || ledger.indexOf(event.name) !== -1) {
      fail(duplicateCode, "键重复：" + event.name);
    }
    applied.push(mark);
    if (remaining > 0) {
      keys.push(event.name);
      remaining -= 1;
      collected += 1;
    } else {
      ledger.push(event.name);
    }
  }
  const state = { keys: keys, ledger: ledger, applied: applied };
  return { state: state, collected: collected, ledger_before: ledger.length,
           ledger: ledger.slice(), judged: judged, judged_bound: events.length };
}

export function close(spec) {
  const source = spec.state || {};
  const keys = (source.keys || []).slice();
  const ledger = (source.ledger || []).slice();
  const applied = (source.applied || []).slice();
  const catchup = ledger.length;
  for (const name of ledger) {
    keys.push(name);
  }
  const state = { keys: keys, ledger: [], applied: applied };
  return { state: state, catchup: catchup };
}
