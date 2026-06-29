export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pickRandom<T>(items: T[], count: number): T[] {
  const pool = [...items]
  const result: T[] = []
  while (result.length < count && pool.length > 0) {
    const index = randomInt(0, pool.length - 1)
    result.push(pool.splice(index, 1)[0])
  }
  return result
}

export function roll(chance: number): boolean {
  return Math.random() < chance
}
