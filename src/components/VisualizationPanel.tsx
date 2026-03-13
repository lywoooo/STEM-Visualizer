import { TERM_COUNT, type AlgorithmOption, type TraceFrame } from '../types'

type VisualizationPanelProps = {
  algorithm: AlgorithmOption
  frame: TraceFrame
}

export function VisualizationPanel({ algorithm, frame }: VisualizationPanelProps) {
  const activeIds = new Set(frame.activeIds)

  return (
    <section className="main">
      <div className="visual-panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Bar Graph</div>
            <p className="panel-note">{frame.note}</p>
          </div>
          <div className="legend">
            <span className="legend-item pointer">current</span>
            <span className="legend-item next">compare</span>
            <span className="legend-item moved">changed</span>
          </div>
        </div>

        <div className="bars-area" aria-label={`${algorithm.label} bar visualization`}>
          {frame.terms.map((term, index) => {
            const left = `${index * (100 / TERM_COUNT)}%`
            const width = `calc(${100 / TERM_COUNT}% - 8px)`
            const stateClass = getStateClass(index, term.id, frame.pointer, frame.nextPointer, activeIds)

            return (
              <div key={term.id} className={`bar ${stateClass}`.trim()} style={{ left, width }}>
                <span className="bar-value">{term.value}</span>
                <div className="bar-fill" style={{ height: `${term.value}%` }} />
                <span className="bar-index">{index}</span>
              </div>
            )
          })}
        </div>

        <div className="array-panel">
          <div className="panel-title">Array View</div>
          <div className="array-row">
            {frame.terms.map((term, index) => {
              const stateClass = getStateClass(index, term.id, frame.pointer, frame.nextPointer, activeIds)

              return (
                <div key={`cell-${term.id}`} className={`array-cell ${stateClass}`.trim()}>
                  <span className="array-index">{index}</span>
                  <strong>{term.value}</strong>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function getStateClass(
  index: number,
  termId: number,
  pointer: number,
  nextPointer: number,
  activeIds: Set<number>,
) {
  if (activeIds.has(termId)) return 'is-moved'
  if (index === pointer) return 'is-pointer'
  if (index === nextPointer) return 'is-next'
  return ''
}
