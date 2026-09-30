const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  vm = require("vm"),
  P = require("../src/puzzle-engine.js");
const level = (extra = {}) => ({
  footprint: [
    { q: 0, r: 0 },
    { q: 1, r: 0 },
    { q: 2, r: 0 },
  ],
  pits: [],
  floors: [],
  redirectors: [],
  swappers: [],
  cyclers: [],
  obstacles: [],
  linkedPairs: [],
  blocks: [],
  ...extra,
});
test("first missing cell ends a route, even when another stone exists beyond the gap", () => {
  const l = level({
    footprint: [
      { q: 0, r: 0 },
      { q: 2, r: 0 },
    ],
    blocks: [
      { q: 0, r: 0, dirIndex: 2 },
      { q: 2, r: 0, dirIndex: 5 },
    ],
  });
  assert.equal(P.trace(l, P.initial(l), P.initial(l)[0]).clear, true);
});
test("pit has priority over farther blockers; floor is traversable; obstacle is permanent", () => {
  const b = { q: 0, r: 0, dirIndex: 2 };
  let l = level({
    blocks: [b, { q: 2, r: 0, dirIndex: 2 }],
    pits: [{ q: 1, r: 0 }],
  });
  assert.equal(P.trace(l, P.initial(l), b).escape, "pit");
  l = { ...l, pits: [], floors: [{ q: 1, r: 0 }] };
  assert.equal(P.trace(l, P.initial(l), b).clear, false);
  l = { ...l, blocks: [b], obstacles: [{ q: 1, r: 0 }] };
  assert.equal(P.solve(l).solved, false);
  assert.equal(P.solve(l, { obstacles: true }).solved, true);
});
test("screen aligned arrows across gaps form a transitive group; removing interleaved stones cannot grow the bound", () => {
  const bs = [0, 3, 6].map((r) => ({ q: 0, r, dirIndex: 0 }));
  assert.equal(P.visualGroups(bs)[0].size, 3);
  assert.equal(P.fitsVisual(bs.slice(0, 2), bs[2]), false);
  const mixed = [...bs, { q: 0, r: 1, dirIndex: 1 }];
  assert.equal(Math.max(...P.visualGroups(mixed).map((g) => g.size)), 3);
});
test("canonical footprints match rotation/reflection/translation, while boundary edits remain visible", () => {
  const a = [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 2, r: 0 },
      { q: 1, r: 1 },
    ],
    b = a.map((c) => ({ q: 7 - c.r, r: 3 + c.q + c.r }));
  assert.equal(P.fingerprint(a), P.fingerprint(b));
  assert.equal(P.similarity(a, b), 1);
  assert.notEqual(P.fingerprint(a), P.fingerprint(a.slice(1)));
});
test("required swap keeps arrows on stones and can strand a premature endpoint removal", () => {
  const l = level({
    footprint: [
      { q: 0, r: 0 },
      { q: -1, r: 0 },
      { q: 1, r: 0 },
      { q: 2, r: 0 },
    ],
    pits: [{ q: 0, r: 0 }],
    obstacles: [{ q: 2, r: 0 }],
    swappers: [{ q: 0, r: 0, aDir: 2, bDir: 5 }],
    blocks: [
      { q: -1, r: 0, dirIndex: 5 },
      { q: 1, r: 0, dirIndex: 2 },
    ],
  });
  assert.equal(P.solve(l).solved, true);
  assert.equal(P.solve(l, { swappers: true }).solved, false);
  const bs = P.initial(l),
    a = P.actions(l, bs).find((a) => a.type === "swap"),
    after = P.apply(bs, a);
  assert.equal(after[0].dirIndex, 5);
  assert.equal(after[0].q, 1);
  const removal = P.actions(l, bs).find((a) => a.type === "remove");
  assert.equal(P.solve(l, {}, 100, P.apply(bs, removal)).solved, false);
});
test("linked readiness is joint and must not be counted as two independent free moves", () => {
  const l = level({
    footprint: [
      { q: -1, r: 0 },
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    blocks: [
      { q: -1, r: 0, dirIndex: 5 },
      { q: 0, r: 0, dirIndex: 2 },
      { q: 1, r: 0, dirIndex: 2 },
    ],
    linkedPairs: [{ id: "p", a: { q: -1, r: 0 }, b: { q: 0, r: 0 } }],
  });
  const a = P.actions(l, P.initial(l));
  assert.deepEqual(
    a.map((x) => x.ids),
    [[2]],
  );
  assert.equal(P.solve(l).solved, true);
});
test("redirect loop is bounded and does not count as a successful escape", () => {
  const l = level({
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    redirectors: [
      { q: 1, r: 0, dirIndex: 5 },
      { q: 0, r: 0, dirIndex: 2 },
    ],
  });
  assert.equal(P.trace(l, [], { q: 0, r: 0, dirIndex: 2 }).loop, true);
});
test("solver budget exhaustion remains explicit", () => {
  const l = level({ blocks: [{ q: 0, r: 0, dirIndex: 5 }] });
  const s = P.solve(l, {}, 0);
  assert.equal(s.exhausted, true);
  assert.equal(s.solved, false);
});
test("fresh QA grant adds exactly 100 to existing coins and runs once", () => {
  const html = fs.readFileSync("index.html", "utf8"),
    code = html.slice(
      html.indexOf("    function loadLocalState()"),
      html.indexOf("    // Apply save data loaded from cloud"),
    );
  const store = new Map([
    ["hexiva-save-v1", JSON.stringify({ coins: 275 })],
    ["hexiva-qa-deploy-marker-v42-6", "1"],
    ["hexiva-qa-v43-fit-20260930-7c6a2f1d", "1"],
    ["hexiva-qa-v43-arrow-20260930-91d4b6ce", "1"],
    ["hexiva-qa-mom-voice-20260930-4e93a1b7", "1"],
  ]);
  const c = {
    console,
    localStorage: {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, v),
    },
    window: {},
    saveLocalState: () => {},
    showHint: () => {},
  };
  vm.createContext(c);
  vm.runInContext(
    "let coins=0;const LOCAL_SAVE_KEY='hexiva-save-v1';const QA_DEPLOY_MARKER_V43='hexiva-qa-v43-20260930-c74f9e21';const QA_DEPLOY_MARKER_V43_FIT='hexiva-qa-v43-fit-20260930-7c6a2f1d';const QA_DEPLOY_MARKER_V43_ARROW='hexiva-qa-v43-arrow-20260930-91d4b6ce';const QA_DEPLOY_MARKER_MOM_VOICE='hexiva-qa-mom-voice-20260930-4e93a1b7';window.applyLoadedSave=data=>{coins=data.coins};" +
      code +
      ";loadLocalState();globalThis.balance=coins;",
    c,
  );
  assert.equal(c.balance, 375);
  store.set("hexiva-save-v1", JSON.stringify({ coins: 375 }));
  vm.runInContext("loadLocalState();globalThis.balance=coins;", c);
  assert.equal(c.balance, 375);
});
test("runtime animated swap/cycle transitions agree with the audited state model on every axis", () => {
  const html = fs.readFileSync("index.html", "utf8"),
    source = html.slice(
      html.indexOf("    function getSwapEndpoint("),
      html.indexOf("    function centerBoard("),
    );
  for (const type of ["swap", "cycle"])
    for (let axis = 0; axis < (type === "swap" ? 3 : 2); axis++) {
      const dirs =
          type === "swap" ? [axis, axis + 3] : [axis, axis + 2, axis + 4],
        m = {
          q: 0,
          r: 0,
          ...(type === "swap" ? { aDir: dirs[0], bDir: dirs[1] } : { dirs }),
          group: { rotation: { y: 0 } },
        };
      const l = level({
        [type === "swap" ? "swappers" : "cyclers"]: [m],
        blocks: dirs.map((d, id) => ({ ...P.step(m, d), dirIndex: id + 1 })),
      });
      const bs = P.initial(l).map((b) => ({
          ...b,
          mesh: { position: { x: b.q, z: b.r, y: 0 } },
        })),
        queue = [];
      class Tween {
        constructor(target) {
          this.target = target;
        }
        to(value) {
          this.value = value;
          return this;
        }
        easing() {
          return this;
        }
        onComplete(fn) {
          this.done = fn;
          return this;
        }
        start() {
          queue.push(() => {
            Object.assign(this.target, this.value);
            this.done?.();
          });
          return this;
        }
      }
      const c = {
        blocks: bs,
        swapAnimating: false,
        levelCompleted: false,
        HEX_HEIGHT: 1,
        HEX_DIRECTIONS: P.D.map(([dq, dr]) => ({ dq, dr })),
        TWEEN: { Tween, Easing: { Quadratic: { InOut: 0 }, Back: { Out: 0 } } },
        playSound: () => {},
        showHint: () => {},
        hexToWorld: (q, r) => ({ x: q, z: r }),
      };
      vm.createContext(c);
      vm.runInContext(source, c);
      c[type === "swap" ? "activateSwapMechanism" : "activateCycleMechanism"](
        m,
      );
      queue.forEach((fn) => fn());
      const action = P.actions(l, P.initial(l)).find((a) => a.type === type),
        expected = P.apply(P.initial(l), action);
      assert.deepEqual(
        bs.map(({ id, q, r, dirIndex }) => ({ id, q, r, dirIndex })),
        expected.map(({ id, q, r, dirIndex }) => ({ id, q, r, dirIndex })),
      );
    }
});
test("candidate creation is deterministic and constrained even before catalog selection", () => {
  const { draft } = require("../scripts/build-catalog.cjs");
  for (const [n, a] of [
    [1, 0],
    [43, 21],
    [619, 9],
    [1000, 3],
  ])
    assert.deepEqual(draft(n, a), draft(n, a));
});
