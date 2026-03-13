import type { AlgorithmKey, Term, TraceAction, TraceFrame } from './types'

const ALGORITHM_KEYS: AlgorithmKey[] = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap', 'linear', 'binary']

export function cloneTerms(terms: Term[]): Term[] {
  return terms.map((term) => ({ ...term }))
}

export function randomTerms(size: number): Term[] {
  return Array.from({ length: size }, (_, id) => ({
    id,
    value: Math.floor(Math.random() * 80) + 10,
  }))
}

export function createFrame(
  terms: Term[],
  pointer: number,
  nextPointer: number,
  action: TraceAction,
  note: string,
  activeIds: number[] = [],
): TraceFrame {
  return {
    terms: cloneTerms(terms),
    pointer,
    nextPointer,
    activeIds,
    action,
    note,
  }
}

export function createDoneFrame(terms: Term[], note = 'Array sorted.'): TraceFrame {
  return createFrame(terms, terms.length - 2, terms.length - 1, 'done', note)
}

export function getInitialConfig() {
  const params = new URLSearchParams(window.location.search)
  const algorithmKey = params.get('algorithm')
  const speed = Number(params.get('speed'))

  return {
    algorithmKey: isAlgorithmKey(algorithmKey) ? algorithmKey : null,
    speedMs: Number.isFinite(speed) && speed > 0 ? speed : 500,
    autoplay: params.get('autoplay') === '1',
  }
}

function isAlgorithmKey(value: string | null): value is AlgorithmKey {
  return value !== null && ALGORITHM_KEYS.includes(value as AlgorithmKey)
}
