import {Client} from "./rpc";

export function getConfig(key: string, def: string): string {
  return window.localStorage.getItem(key) || def;
}

export function setConfigWatcher(key: string) {
  return {
    handler: (value: any) => window.localStorage.setItem(key, value.toString())
  }
}

export function avgClientVolumePercent(clients: Client[]) {
  const volumes = clients.map(c => c.config.volume.percent);
  if (!volumes.length) return 0;
  const sum = volumes.reduce((a, b) => a + b, 0);
  return sum / volumes.length;
}

type Zip<T extends unknown[][]> = { [I in keyof T]: T[I] extends (infer U)[] ? U : never }[];

export function zip<T extends unknown[][]>(...args: T): Zip<T> {
  return <Zip<T>><unknown>(args[0].map((_, c) => args.map(row => row[c])));
}
