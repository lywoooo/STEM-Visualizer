import type { AlgorithmOption } from '../types'

type InfoPanelProps = {
  algorithm: AlgorithmOption
  frameIndex: number
  frameCount: number
  speedMs: number
  target: number
  onSpeedChange: (speedMs: number) => void
}

export function InfoPanel({ algorithm, frameIndex, frameCount, speedMs, target, onSpeedChange }: InfoPanelProps) {
  return (
    <aside className="info">
      <div className="info-section">
        <div className="info-title">Frame</div>
        <p>
          {frameIndex + 1} / {frameCount}
        </p>
      </div>

      <div className="info-section">
        <div className="info-title">Speed</div>
        <input
          type="range"
          min={220}
          max={1200}
          step={20}
          value={speedMs}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
        />
      </div>

      <div className="info-section">
        <div className="info-title">Description</div>
        <p>{algorithm.description}</p>
        <div className="detail-list">
          {algorithm.details.map((detail) => (
            <p key={detail}>{detail}</p>
          ))}
        </div>
      </div>

      {algorithm.group === 'Searching' && (
        <div className="info-section">
          <div className="info-title">Target</div>
          <p>{target}</p>
        </div>
      )}

      <div className="info-section">
        <div className="info-title">Code</div>
        <pre>{algorithm.code}</pre>
      </div>
    </aside>
  )
}
