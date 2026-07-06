export function generateId(): string {
  const hex = '0123456789abcdef';
  const rng = typeof crypto !== 'undefined' && crypto.getRandomValues
    ? () => crypto.getRandomValues(new Uint8Array(1))[0] / 256
    : () => Math.random();
  let id = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) { id += '-'; continue; }
    const v = (rng() * 16) | 0;
    id += i === 14 ? '4' : i === 19 ? hex[(v & 0x3) | 0x8] : hex[v];
  }
  return id;
}
