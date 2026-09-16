declare module 'topojson-client' {
  export function feature(topology: unknown, object: unknown): unknown;
}

declare module 'world-atlas/countries-110m.json' {
  const topology: {
    objects?: {
      countries?: unknown;
    };
  };
  export default topology;
}
