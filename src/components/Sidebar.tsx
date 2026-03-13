import { ALGORITHMS } from '../algorithms'
import type { AlgorithmKey } from '../types'

type SidebarProps = {
  algorithmKey: AlgorithmKey
  onSelect: (key: AlgorithmKey) => void
}

export function Sidebar({ algorithmKey, onSelect }: SidebarProps) {
  const sortingAlgorithms = ALGORITHMS.filter((item) => item.group === 'Sorting')
  const searchingAlgorithms = ALGORITHMS.filter((item) => item.group === 'Searching')

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Sorting</div>
      {sortingAlgorithms.map((algorithm) => (
        <button
          key={algorithm.key}
          type="button"
          className={`sidebar-item ${algorithm.key === algorithmKey ? 'active' : ''}`}
          onClick={() => onSelect(algorithm.key)}
        >
          {algorithm.label}
        </button>
      ))}

      <div className="sidebar-title section-break">Searching</div>
      {searchingAlgorithms.map((algorithm) => (
        <button
          key={algorithm.key}
          type="button"
          className={`sidebar-item ${algorithm.key === algorithmKey ? 'active' : ''}`}
          onClick={() => onSelect(algorithm.key)}
        >
          {algorithm.label}
        </button>
      ))}
    </aside>
  )
}
