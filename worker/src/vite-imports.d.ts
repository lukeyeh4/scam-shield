// The Worker shares code with the app (src/tools/), which uses Vite's import.meta
// features. They're never used on the Worker; this only lets it type-check.
interface ImportMeta {
  env: Record<string, string | undefined>
  glob: <T>(pattern: string, options?: object) => Record<string, T>
}
