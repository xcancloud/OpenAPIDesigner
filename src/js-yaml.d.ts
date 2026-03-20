declare module 'js-yaml' {
  interface DumpOptions {
    indent?: number;
    lineWidth?: number;
    noRefs?: boolean;
    [key: string]: unknown;
  }
  export function load(str: string): unknown;
  export function dump(obj: unknown, opts?: DumpOptions): string;
}
