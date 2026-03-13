export const TERM_COUNT = 12

export type AlgorithmKey = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap' | 'linear' | 'binary'
export type AlgorithmGroup = 'Sorting' | 'Searching'

export type Term = {
  id: number
  value: number
}

export type TraceAction = 'compare' | 'swap' | 'found' | 'done'

export type TraceFrame = {
  terms: Term[]
  pointer: number
  nextPointer: number
  activeIds: number[]
  action: TraceAction
  note: string
}

export type AlgorithmOption = {
  key: AlgorithmKey
  label: string
  group: AlgorithmGroup
  description: string
  details: string[]
  code: string
  buildTrace: (seed: Term[], target: number) => TraceFrame[]
}
