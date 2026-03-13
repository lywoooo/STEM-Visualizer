import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { ALGORITHMS } from './algorithms'
import { InfoPanel } from './components/InfoPanel'
import { Sidebar } from './components/Sidebar'
import { VisualizationPanel } from './components/VisualizationPanel'
import { type AlgorithmKey, TERM_COUNT } from './types'
import { cloneTerms, getInitialConfig, randomTerms } from './utils'

function App() {
  const initialConfig = useMemo(() => getInitialConfig(), [])
  const [algorithmKey, setAlgorithmKey] = useState<AlgorithmKey>(initialConfig.algorithmKey ?? 'bubble')
  const [baseSeed, setBaseSeed] = useState(() => randomTerms(TERM_COUNT))
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(initialConfig.autoplay)
  const [speedMs, setSpeedMs] = useState(initialConfig.speedMs)

  const algorithm = useMemo(
    () => ALGORITHMS.find((item) => item.key === algorithmKey) ?? ALGORITHMS[0],
    [algorithmKey],
  )

  const preparedSeed = useMemo(() => {
    if (algorithm.group === 'Searching') {
      return cloneTerms(baseSeed).sort((left, right) => left.value - right.value)
    }
    return baseSeed
  }, [algorithm.group, baseSeed])

  const target = useMemo(() => {
    const midIndex = Math.floor(preparedSeed.length / 2)
    return preparedSeed[midIndex]?.value ?? 0
  }, [preparedSeed])

  const frames = useMemo(() => algorithm.buildTrace(preparedSeed, target), [algorithm, preparedSeed, target])
  const frame = frames[Math.min(frameIndex, frames.length - 1)]

  useEffect(() => {
    if (!playing) return

    const id = window.setInterval(() => {
      setFrameIndex((current) => {
        const next = current + 1
        if (next >= frames.length) {
          setPlaying(false)
          return current
        }
        return next
      })
    }, speedMs)

    return () => window.clearInterval(id)
  }, [frames.length, playing, speedMs])

  const stopPlayback = () => setPlaying(false)

  const resetPlayback = () => {
    setFrameIndex(0)
    stopPlayback()
  }

  const handleAlgorithmSelect = (nextAlgorithm: AlgorithmKey) => {
    setAlgorithmKey(nextAlgorithm)
    resetPlayback()
  }

  const handleNewData = () => {
    setBaseSeed(randomTerms(TERM_COUNT))
    resetPlayback()
  }

  const handleStepForward = () => {
    stopPlayback()
    setFrameIndex((current) => Math.min(current + 1, frames.length - 1))
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="breadcrumb">Algorithms Visualizer</p>
          <h1>{algorithm.label}</h1>
        </div>

        <div className="controls">
          <button onClick={handleNewData}>New Data</button>
          <button onClick={resetPlayback}>Reset</button>
          <button onClick={handleStepForward}>Step</button>
          <button onClick={() => setPlaying((current) => !current)}>{playing ? 'Pause' : 'Play'}</button>
        </div>
      </header>

      <section className="workspace">
        <Sidebar algorithmKey={algorithmKey} onSelect={handleAlgorithmSelect} />
        <VisualizationPanel algorithm={algorithm} frame={frame} />
        <InfoPanel
          algorithm={algorithm}
          frameIndex={frameIndex}
          frameCount={frames.length}
          speedMs={speedMs}
          target={target}
          onSpeedChange={setSpeedMs}
        />
      </section>
    </main>
  )
}

export default App
