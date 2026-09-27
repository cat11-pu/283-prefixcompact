// compactrun.js：按收键预算收键并留账（基线：一律给空表）
import { commonPrefix, blockPrefix } from "./lcp.js";

export function step(spec) {
  return { state: spec.state, collected: 0, ledger_before: 0, ledger: [], judged: 0, judged_bound: 0 };
}

export function close(spec) {
  return { state: spec.state, catchup: 0 };
}
