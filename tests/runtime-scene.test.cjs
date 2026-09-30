const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  vm = require("vm");
test("all 1250 catalog boards construct and clean up with real Three.js geometry (renderer stub)", () => {
  const THREE = { ...require("three") },
    events = new Map(),
    elements = new Map();
  const element = (id) => {
    if (!elements.has(id))
      elements.set(id, {
        id,
        style: { setProperty() {} },
        dataset: {},
        classList: {
          add() {},
          remove() {},
          contains() {
            return false;
          },
          toggle() {},
        },
        addEventListener(type, fn) {
          events.set(id + ":" + type, fn);
        },
        removeEventListener() {},
        appendChild() {},
        removeChild() {},
        querySelectorAll() {
          return [];
        },
        getBoundingClientRect() {
          return {
            left: 0,
            top: 0,
            width: 390,
            height: 844,
            bottom: 844,
            right: 390,
          };
        },
        clientWidth: 390,
        clientHeight: 844,
        textContent: "",
        innerHTML: "",
      });
    return elements.get(id);
  };
  THREE.WebGLRenderer = class {
    constructor() {
      this.domElement = element("game-canvas");
      this.shadowMap = {};
    }
    setSize() {}
    setPixelRatio() {}
    setClearColor() {}
    render() {}
  };
  const c = {
    console,
    THREE,
    TWEEN: require("@tweenjs/tween.js"),
    URLSearchParams,
    Map,
    Set,
    Math,
    Date,
    JSON,
    setTimeout: () => 0,
    clearTimeout() {},
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    localStorage: { getItem: () => null, setItem() {} },
    window: {
      innerWidth: 390,
      innerHeight: 844,
      devicePixelRatio: 1,
      addEventListener() {},
      matchMedia: () => ({ matches: false }),
      cloudSaveHandler: null,
    },
    navigator: { hardwareConcurrency: 8, deviceMemory: 8 },
    location: { reload() {} },
    document: {
      hidden: false,
      getElementById: element,
      createElement: () => element("new"),
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener() {},
      body: element("body"),
      documentElement: element("html"),
    },
  };
  vm.createContext(c);
  vm.runInContext(fs.readFileSync("src/catalog.js", "utf8"), c);
  const scripts = [
    ...fs
      .readFileSync("index.html", "utf8")
      .matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g),
  ].map((m) => m[1]);
  const main = scripts.find((s) => s.includes("let audioEnabled = true;"));
  vm.runInContext(main, c);
  assert.equal(c.window.HEXIVA_CATALOG.length, 1250);
  for (const l of c.window.HEXIVA_CATALOG) {
    c.buildLevel(l.level);
    const count = vm.runInContext("blocks.length", c);
    assert.equal(count, l.blocks.length, `scene count ${l.level}`);
    assert.equal(
      vm.runInContext("activeObstacles.length", c),
      l.obstacles.length,
    );
    assert.equal(
      vm.runInContext("activeLinkedPairs.length", c),
      l.linkedPairs.length,
    );
  }
  c.buildLevel(43);
  const snapshot = vm.runInContext(
    "JSON.stringify(blocks.map(b=>[b.q,b.r,b.dirIndex]))",
    c,
  );
  c.buildLevel(43);
  assert.equal(
    vm.runInContext("JSON.stringify(blocks.map(b=>[b.q,b.r,b.dirIndex]))", c),
    snapshot,
  );
});
