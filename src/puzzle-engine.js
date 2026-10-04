/* Pure puzzle rules. Node audit and browser use the same transition model. */
(function (root) {
  const D = [
    [0, -1],
    [1, -1],
    [1, 0],
    [0, 1],
    [-1, 1],
    [-1, 0],
  ];
  const key = (c) => `${c.q},${c.r}`;
  const step = (c, d) => ({ q: c.q + D[d][0], r: c.r + D[d][1] });
  function neighbours(c) {
    return D.map(([dq, dr]) => ({ q: c.q + dq, r: c.r + dr }));
  }
  const cache = new WeakMap();
  function trace(level, blocks, block, ignore = {}) {
    let env = cache.get(level);
    if (
      !env ||
      env.wall !== level.obstacles ||
      env.redir !== level.redirectors
    ) {
      env = {
        footprint: new Set(level.footprint.map(key)),
        pits: new Set(level.pits.map(key)),
        obstacles: new Set(level.obstacles.map(key)),
        redirects: new Map(level.redirectors.map((c) => [key(c), c])),
        wall: level.obstacles,
        redir: level.redirectors,
      };
      cache.set(level, env);
    }
    const { footprint, pits } = env,
      obstacles = ignore.obstacles ? new Set() : env.obstacles,
      redirects = ignore.redirectors ? new Map() : env.redirects;
    const occupied = new Map(blocks.map((c) => [key(c), c]));
    let c = block,
      d = block.dirIndex;
    const visited = new Set(),
      path = [],
      turns = [];
    for (let n = 0; n < 48; n++) {
      c = step(c, d);
      const k = key(c);
      path.push(k);
      if (pits.has(k)) return { clear: true, path, turns, escape: "pit" };
      if (!footprint.has(k))
        return { clear: true, path, turns, escape: "edge" };
      if (obstacles.has(k)) return { clear: false, path, turns, obstacle: k };
      if (occupied.has(k))
        return { clear: false, path, turns, blocker: occupied.get(k).id };
      if (redirects.has(k)) {
        const s = k + "|" + d;
        if (visited.has(s)) return { clear: false, path, turns, loop: true };
        visited.add(s);
        const nd = redirects.get(k).dirIndex;
        if (nd !== d) turns.push(k);
        d = nd;
      }
    }
    return { clear: false, path, turns, loop: true };
  }
  function initial(level) {
    return level.blocks.map((b, i) => ({ ...b, id: i }));
  }
  function actions(level, blocks, ignore = {}) {
    const routes = new Map(
      blocks.map((b) => [b.id, trace(level, blocks, b, ignore)]),
    );
    const paired = new Set(),
      out = [];
    if (!ignore.linkedPairs)
      for (const p of level.linkedPairs) {
        const a = blocks.find((b) => key(b) === key(p.a)),
          b = blocks.find((b) => key(b) === key(p.b));
        if (a) paired.add(a.id);
        if (b) paired.add(b.id);
        if (a && b && routes.get(a.id).clear && routes.get(b.id).clear)
          out.push({ type: "linked", ids: [a.id, b.id], cell: key(a) });
      }
    for (const b of blocks)
      if (!paired.has(b.id) && routes.get(b.id).clear)
        out.push({ type: "remove", ids: [b.id], cell: key(b) });
    for (const [type, items] of [
      ["swap", level.swappers],
      ["cycle", level.cyclers],
    ]) {
      if (ignore[type === "swap" ? "swappers" : "cyclers"]) continue;
      for (let index = 0; index < items.length; index++) {
        const m = items[index],
          dirs = type === "swap" ? [m.aDir, m.bDir] : m.dirs;
        const cells = dirs.map((d) => step(m, d));
        const members = cells.map((c) => blocks.find((b) => key(b) === key(c)));
        if (members.every(Boolean))
          out.push({
            type,
            index,
            ids: members.map((b) => b.id),
            cells,
            cell: key(m),
          });
      }
    }
    return out;
  }
  function apply(blocks, a) {
    if (a.type === "remove" || a.type === "linked")
      return blocks.filter((b) => !a.ids.includes(b.id));
    return blocks.map((b) => {
      const i = a.ids.indexOf(b.id);
      return i < 0 ? b : { ...b, ...a.cells[(i + 1) % a.cells.length] };
    });
  }
  const stateKey = (blocks) =>
    blocks
      .map((b) => `${b.id}:${key(b)}`)
      .sort()
      .join(";");
  function solve(level, ignore = {}, budget = 20000, start = initial(level)) {
    const failed = new Set(),
      visiting = new Set();
    let nodes = 0,
      exhausted = false;
    function dfs(blocks) {
      if (!blocks.length) return [];
      if (++nodes > budget) {
        exhausted = true;
        return null;
      }
      const k = stateKey(blocks);
      if (failed.has(k) || visiting.has(k)) return null;
      visiting.add(k);
      let legal = actions(level, blocks, ignore);
      // Removing a non-arm stone only frees cells. These actions commute and cannot
      // disable a rearrangement, so exploring their factorial permutations adds no proof.
      const armCells = new Set([
        ...level.swappers.flatMap((m) =>
          [m.aDir, m.bDir].map((d) => key(step(m, d))),
        ),
        ...level.cyclers.flatMap((m) => m.dirs.map((d) => key(step(m, d)))),
      ]);
      const safe = legal.find(
        (a) =>
          (a.type === "remove" || a.type === "linked") &&
          a.ids.every(
            (id) => !armCells.has(key(blocks.find((b) => b.id === id))),
          ),
      );
      if (safe) legal = [safe];
      for (const a of legal) {
        const rest = dfs(apply(blocks, a));
        if (rest) {
          visiting.delete(k);
          return [a, ...rest];
        }
      }
      visiting.delete(k);
      if (!exhausted) failed.add(k);
      return null;
    }
    const solution = dfs(start);
    return { solved: solution !== null, solution, nodes, exhausted };
  }
  // Screen projection of the actual hexToWorld mapping, in one-neighbour spacings.
  // The approved camera (0,24,9.5) compresses z by 24/hypot(24,9.5).
  function screen(c) {
    return {
      x: (Math.sqrt(3) / 2) * c.q,
      y: ((c.r + c.q / 2) * 24) / Math.hypot(24, 9.5),
    };
  }
  function visuallyRelated(a, b, blocks) {
    const dq = b.q - a.q,
      dr = b.r - a.r;
    // Squared distance in the exact same camera projection; avoid allocating
    // screen points for the millions of construction pair checks.
    const projectedZ = dr + dq / 2;
    if (
      0.75 * dq * dq + (576 / (576 + 90.25)) * projectedZ * projectedZ <=
      2.06 * 2.06
    )
      return true;
    // Collinear alignment is a separate cue outside a radius-2 disk. We also
    // include interleaved arrows conservatively: removing them must not expose
    // a new three-stone row that escaped the opening audit.
    const steps = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
    if (steps > 4 || !(dq === 0 || dr === 0 || dq + dr === 0)) return false;
    return true;
  }
  function visualGroups(blocks) {
    const pts = blocks.map(screen),
      seen = new Set(),
      groups = [];
    for (let i = 0; i < blocks.length; i++) {
      if (seen.has(i)) continue;
      const ids = [i],
        queue = [i];
      seen.add(i);
      while (queue.length) {
        const j = queue.pop();
        for (let k = 0; k < blocks.length; k++) {
          if (seen.has(k) || blocks[k].dirIndex !== blocks[j].dirIndex)
            continue;
          // Includes a one-cell gap and staggered diagonal neighbours; transitive closure
          // catches strings that no single radius-2 centre could contain.
          if (visuallyRelated(blocks[j], blocks[k], blocks)) {
            seen.add(k);
            ids.push(k);
            queue.push(k);
          }
        }
      }
      groups.push({
        direction: blocks[i].dirIndex,
        cells: ids.map((j) => key(blocks[j])),
        screen: ids.map((j) => pts[j]),
        size: ids.length,
      });
    }
    return groups;
  }
  function fitsVisual(blocks, b) {
    const all = [...blocks, b],
      same = blocks.filter((c) => c.dirIndex === b.dirIndex);
    const near = same.filter((c) => visuallyRelated(b, c, all));
    if (!near.length) return true;
    if (near.length > 1) return false;
    return !same.some((c) => c !== near[0] && visuallyRelated(near[0], c, all));
  }
  function variants(cells) {
    const out = [];
    for (let mirror = 0; mirror < 2; mirror++)
      for (let rot = 0; rot < 6; rot++) {
        let v = cells.map((c) => ({ q: c.q, r: mirror ? -c.q - c.r : c.r }));
        for (let i = 0; i < rot; i++)
          v = v.map((c) => ({ q: -c.r, r: c.q + c.r }));
        const q = Math.min(...v.map((c) => c.q)),
          r = Math.min(...v.map((c) => c.r));
        out.push(
          v
            .map((c) => ({ q: c.q - q, r: c.r - r }))
            .sort((a, b) => a.q - b.q || a.r - b.r),
        );
      }
    return out;
  }
  const fingerprint = (cells) =>
    variants(cells)
      .map((v) => v.map(key).join(";"))
      .sort()[0];
  function similarity(a, b) {
    // Count all translation overlaps for each rotation/reflection. Every matching
    // pair votes for its translation; the maximum vote is the exact best overlap.
    const av = variants(a)[0];
    let overlap = 0;
    for (const bv of variants(b)) {
      const votes = new Map();
      for (const ca of av)
        for (const cb of bv) {
          const k = `${ca.q - cb.q},${ca.r - cb.r}`;
          const n = (votes.get(k) || 0) + 1;
          votes.set(k, n);
          overlap = Math.max(overlap, n);
        }
    }
    return overlap / (a.length + b.length - overlap);
  }
  function dependencyPhase(level, blocks) {
    const edges = [];
    for (const b of blocks) {
      const t = trace(level, [], b);
      for (const c of blocks)
        if (c.id !== b.id && t.path.includes(key(c)))
          edges.push({ from: b.id, requires: c.id });
    }
    const byId = new Map(blocks.map((b) => [b.id, b])),
      adj = new Map(
        blocks.map((b) => [
          b.id,
          edges.filter((e) => e.from === b.id).map((e) => e.requires),
        ]),
      );
    const memo = new Map(),
      stack = new Set();
    let cyclic = false;
    function depth(id) {
      if (memo.has(id)) return memo.get(id);
      if (stack.has(id)) {
        cyclic = true;
        return 0;
      }
      stack.add(id);
      const n = 1 + Math.max(0, ...(adj.get(id) || []).map(depth));
      stack.delete(id);
      memo.set(id, n);
      return n;
    }
    const maxDepth = Math.max(0, ...blocks.map((b) => depth(b.id)));
    let bs = blocks,
      waves = [];
    while (bs.length) {
      const legal = actions(level, bs).filter(
        (a) => a.type === "remove" || a.type === "linked",
      );
      if (!legal.length) break;
      const ids = new Set(legal.flatMap((a) => a.ids));
      waves.push(ids.size);
      bs = bs.filter((b) => !ids.has(b.id));
    }
    return { edges, depth: maxDepth, cyclic, waves, stalled: bs.length > 0 };
  }
  function metrics(level, proof = solve(level)) {
    let bs = initial(level),
      maxGroup = 0;
    const witnesses = [],
      waves = [];
    const startActions = actions(level, bs),
      open = startActions.filter(
        (a) => a.type === "remove" || a.type === "linked",
      );
    const trivial = open.filter((a) =>
      a.ids.every((id) => {
        const t = trace(
          level,
          bs,
          bs.find((b) => b.id === id),
        );
        return t.escape === "edge" && t.path.length === 1;
      }),
    );
    const mechanisms = [];
    for (const [type, items, ignored] of [
      ["redirect", level.redirectors, "redirectors"],
      ["swap", level.swappers, "swappers"],
      ["cycle", level.cyclers, "cyclers"],
      ["linked", level.linkedPairs, "linkedPairs"],
      ["obstacle", level.obstacles, "obstacles"],
    ]) {
      // Each individual instance must matter. Restrict removal to one instance below.
      items.forEach((m, index) =>
        mechanisms.push({
          type,
          index,
          cell: type === "linked" ? key(m.a) : key(m),
          used: 0,
          affectedRoutes: 0,
          counterfactualChanges: 0,
        }),
      );
    }
    let decisionSteps = 0,
      forcedRun = 0,
      maxForcedRun = 0,
      unlockingChoices = 0;
    const openingUnlocks = new Set(),
      dependencyPhases = [dependencyPhase(level, bs)];
    for (const a of proof.solution || []) {
      const gs = visualGroups(bs);
      for (const g of gs) {
        maxGroup = Math.max(maxGroup, g.size);
        if (g.size > 2 && witnesses.length < 12) witnesses.push(g);
      }
      const legal = actions(level, bs);
      if (legal.length >= 2) {
        decisionSteps++;
        forcedRun = 0;
      } else {
        forcedRun++;
        maxForcedRun = Math.max(maxForcedRun, forcedRun);
      }
      const after = apply(bs, a),
        oldLegal = new Set(legal.map((x) => x.type + ":" + x.cell));
      const unlocked = actions(level, after).filter(
        (x) => !oldLegal.has(x.type + ":" + x.cell),
      ).length;
      if (unlocked > 0) unlockingChoices++;
      if (bs.length === level.blocks.length && unlocked > 0)
        openingUnlocks.add(a.cell);
      for (const m of mechanisms) {
        if (a.type === m.type && a.index === m.index) m.used++;
        if (m.type === "linked" && a.type === "linked" && a.cell === m.cell)
          m.used++;
        if (
          m.type === "redirect" &&
          (a.type === "remove" || a.type === "linked")
        )
          for (const id of a.ids)
            if (
              trace(
                level,
                bs,
                bs.find((b) => b.id === id),
              ).turns.includes(m.cell)
            )
              m.used++;
        if (m.type === "obstacle" || m.type === "redirect") {
          const modified = {
            ...level,
            [m.type === "obstacle" ? "obstacles" : "redirectors"]: level[
              m.type === "obstacle" ? "obstacles" : "redirectors"
            ].filter((_, i) => i !== m.index),
          };
          for (const b of bs) {
            const t = trace(level, bs, b),
              t2 = trace(modified, bs, b);
            if (
              (m.type === "obstacle" && t.obstacle === m.cell) ||
              (m.type === "redirect" && t.turns.includes(m.cell))
            )
              m.affectedRoutes++;
            if (t.clear !== t2.clear) m.counterfactualChanges++;
          }
        }
      }
      bs = after;
      if (a.type === "swap" || a.type === "cycle")
        dependencyPhases.push(dependencyPhase(level, bs));
    }
    // Opening actions may unlock different future fronts, not just different arrow colours.
    let meaningfulOpeningCount = 0;
    const openingFronts = [];
    for (const a of startActions) {
      const after = apply(initial(level), a);
      const before = new Set(startActions.map((x) => x.type + ":" + x.cell));
      const u = actions(level, after)
        .filter((x) => !before.has(x.type + ":" + x.cell))
        .map((x) => x.type + ":" + x.cell)
        .sort();
      if (u.length) {
        meaningfulOpeningCount++;
        openingFronts.push(u.join("|"));
      }
    }
    // Clearance waves include the linked rule. Rearrangements are counted separately.
    bs = initial(level);
    let stalled = false;
    for (let guard = 0; bs.length && guard <= level.blocks.length; guard++) {
      const clear = actions(level, bs).filter(
        (a) => a.type === "remove" || a.type === "linked",
      );
      if (!clear.length) {
        stalled = true;
        break;
      }
      const ids = new Set(clear.flatMap((a) => a.ids));
      waves.push(ids.size);
      bs = bs.filter((b) => !ids.has(b.id));
    }
    const necessity = {};
    for (const [type, ignore] of [
      ["swap", "swappers"],
      ["cycle", "cyclers"],
    ]) {
      if (level[ignore].length) {
        const counter = solve(level, { [ignore]: true }, 20000);
        necessity[type] = !counter.solved && !counter.exhausted;
      }
    }
    for (const m of mechanisms) {
      m.functional =
        m.type === "obstacle"
          ? m.counterfactualChanges > 0
          : m.type === "redirect"
            ? m.used > 0 && m.counterfactualChanges > 0
            : m.type === "linked"
              ? m.used > 0 &&
                level.linkedPairs.some((p) => {
                  const a = level.blocks.find((b) => key(b) === key(p.a)),
                    b = level.blocks.find((b) => key(b) === key(p.b));
                  return (
                    a &&
                    b &&
                    trace(level, initial(level), a).clear !==
                      trace(level, initial(level), b).clear
                  );
                })
              : m.used > 0 && necessity[m.type];
    }
    const groups = visualGroups(initial(level));
    maxGroup = Math.max(maxGroup, ...groups.map((g) => g.size));
    return {
      blockCount: level.blocks.length,
      solvabilityStalled: !proof.solved,
      solverExhausted: proof.exhausted,
      solverNodes: proof.nodes,
      maxSameDirectionVisualGroup: maxGroup,
      visualViolations: witnesses.length
        ? witnesses
        : groups.filter((g) => g.size > 2),
      initiallyClearCount: open.length,
      initiallyClearRatio:
        open.reduce((s, a) => s + a.ids.length, 0) / level.blocks.length,
      trivialEscapeRatio:
        trivial.reduce((s, a) => s + a.ids.length, 0) / level.blocks.length,
      meaningfulOpeningCount,
      distinctOpeningFronts: new Set(openingFronts).size,
      decisionSteps,
      unlockingChoices,
      maxForcedRun,
      clearanceWaves: waves,
      clearanceWaveCount: waves.length,
      dependencyDepth: Math.max(
        ...dependencyPhases.filter((p) => !p.cyclic).map((p) => p.depth),
        0,
      ),
      dependencyPhases,
      postMechanismClearanceWaves: dependencyPhases
        .slice(1)
        .map((p) => p.waves),
      routeOnlyStalled: stalled,
      mechanismNecessity: necessity,
      mechanisms,
      nonfunctionalMechanisms: mechanisms.filter((m) => !m.functional),
      footprintFingerprint: fingerprint(level.footprint),
    };
  }
  const api = {
    D,
    key,
    step,
    neighbours,
    trace,
    initial,
    actions,
    apply,
    solve,
    screen,
    visuallyRelated,
    visualGroups,
    fitsVisual,
    variants,
    fingerprint,
    similarity,
    dependencyPhase,
    metrics,
  };
  if (typeof module !== "undefined") module.exports = api;
  else root.HexivaPuzzle = api;
})(typeof window !== "undefined" ? window : globalThis);
