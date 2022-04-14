export function fiksForPikselratio(tall: number): number {
  // @ts-ignore
  return tall * globalThis.pixelRatio;
}

export function fiksForPikselratioInverted(tall: number): number {
  // @ts-ignore
  return tall / globalThis.pixelRatio;
}
