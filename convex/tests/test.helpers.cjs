/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness uses CommonJS to transpile TypeScript in memory. */
// Local handler tests: no deployment, network, component calls, or extra dependencies.
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");

function createLoader({ overrides = {} } = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(root, file);
    const relative = path.relative(root, file).replaceAll("\\", "/");
    if (relative in overrides) return overrides[relative];
    if (cache.has(file)) return cache.get(file).exports;
    const loadedModule = { exports: {} };
    cache.set(file, loadedModule);
    const requireDependency = Module.createRequire(file);
    const localRequire = (id) => {
      if (id in overrides) return overrides[id];
      if (id.startsWith(".") || id.startsWith("@/")) {
        const base = id.startsWith("@/")
          ? path.join(root, "src", id.slice(2))
          : path.resolve(path.dirname(file), id);
        const target = [
          base,
          base.replace(/\.js$/, ".ts"),
          base + ".ts",
          base + ".js",
        ].find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
        if (target && /\.[jt]s$/.test(target)) return load(target);
      }
      return requireDependency(id);
    };
    const result = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      fileName: file,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      reportDiagnostics: true,
    });
    const errors = (result.diagnostics ?? []).filter(
      (d) => d.category === ts.DiagnosticCategory.Error,
    );
    if (errors.length)
      throw new Error(
        ts.formatDiagnosticsWithColorAndContext(errors, {
          getCanonicalFileName: (f) => f,
          getCurrentDirectory: () => root,
          getNewLine: () => "\n",
        }),
      );
    new Function("require", "module", "exports", result.outputText)(
      localRequire,
      loadedModule,
      loadedModule.exports,
    );
    return loadedModule.exports;
  }
  return load;
}

function createContext(seed = {}, subject = "owner") {
  const tables = structuredClone(seed);
  let sequence = 100;
  const writes = [];
  const db = {
    async get(id) {
      return (
        Object.values(tables)
          .flat()
          .find((row) => row._id === id) ?? null
      );
    },
    async insert(table, fields) {
      const row = {
        ...structuredClone(fields),
        _id: table + ":" + sequence++,
        _creationTime: sequence,
      };
      (tables[table] ??= []).push(row);
      writes.push(["insert", table, structuredClone(fields)]);
      return row._id;
    },
    async patch(id, fields) {
      const row = await db.get(id);
      if (!row) throw new Error("Missing row " + id);
      Object.assign(row, structuredClone(fields));
      for (const key of Object.keys(row))
        if (row[key] === undefined) delete row[key];
      writes.push(["patch", id, structuredClone(fields)]);
    },
    query(table) {
      let rows = [...(tables[table] ?? [])];
      const query = {
        withIndex(name, select) {
          const equalities = [];
          const range = {
            eq(field, value) {
              equalities.push([field, value]);
              return range;
            },
          };
          select(range);
          rows = rows.filter((row) =>
            equalities.every(([field, value]) => row[field] === value),
          );
          const fields =
            name === "by_roadmap_and_order"
              ? ["order", "_creationTime"]
              : ["_creationTime"];
          rows.sort((a, b) => {
            for (const field of fields) {
              const delta = (a[field] ?? 0) - (b[field] ?? 0);
              if (delta) return delta;
            }
            return 0;
          });
          return query;
        },
        order(direction) {
          if (direction === "desc") rows.reverse();
          return query;
        },
        async collect() {
          return rows;
        },
        async take(count) {
          return rows.slice(0, count);
        },
        async unique() {
          if (rows.length > 1) throw new Error("Duplicate index result");
          return rows[0] ?? null;
        },
      };
      return query;
    },
  };
  return {
    db,
    tables,
    writes,
    auth: {
      async getUserIdentity() {
        return subject === null ? null : { subject };
      },
    },
    storage: {
      async generateUploadUrl() {
        return "https://storage.test/upload";
      },
    },
  };
}

module.exports = { createLoader, createContext, root };
