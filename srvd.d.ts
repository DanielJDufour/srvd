export function serve(options?: {
  acceptRanges?: boolean,
  debug?: boolean,
  max?: number,
  wait?: number,
  root?: string,
  port?: number
}): {
  acceptRanges: boolean,
  debug: boolean,
  max: number,
  server: any,
  port: number,
  root: string,
  wait: number
}
