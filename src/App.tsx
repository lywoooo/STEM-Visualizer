import { useEffect, useMemo, useState } from 'react'
import './App.css'

const TERM_COUNT = 12

type AlgorithmKey = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap' | 'linear' | 'binary'
type AlgorithmGroup = 'Sorting' | 'Searching'

type Term = {
  id: number
  value: number
}

type TraceFrame = {
  terms: Term[]
  pointer: number
  nextPointer: number
  activeIds: number[]
  action: 'compare' | 'swap' | 'found' | 'done'
  note: string
}

type AlgorithmOption = {
  key: AlgorithmKey
  label: string
  group: AlgorithmGroup
  description: string
  details: string[]
  code: string
  buildTrace: (seed: Term[], target: number) => TraceFrame[]
}

function cloneTerms(terms: Term[]): Term[] {
  return terms.map((term) => ({ ...term }))
}

function randomTerms(size: number): Term[] {
  return Array.from({ length: size }, (_, id) => ({
    id,
    value: Math.floor(Math.random() * 80) + 10,
  }))
}

function buildBubbleTrace(seed: Term[]): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  for (let pass = 0; pass < terms.length - 1; pass += 1) {
    let swapped = false
    for (let j = 0; j < terms.length - pass - 1; j += 1) {
      frames.push({
        terms: cloneTerms(terms),
        pointer: j,
        nextPointer: j + 1,
        activeIds: [],
        action: 'compare',
        note: `Compare index ${j} with ${j + 1}.`,
      })

      if (terms[j].value > terms[j + 1].value) {
        const leftId = terms[j].id
        const rightId = terms[j + 1].id
        ;[terms[j], terms[j + 1]] = [terms[j + 1], terms[j]]
        frames.push({
          terms: cloneTerms(terms),
          pointer: j,
          nextPointer: j + 1,
          activeIds: [leftId, rightId],
          action: 'swap',
          note: 'Swap the adjacent pair.',
        })
        swapped = true
      }
    }
    if (!swapped) break
  }

  frames.push({
    terms: cloneTerms(terms),
    pointer: terms.length - 2,
    nextPointer: terms.length - 1,
    activeIds: [],
    action: 'done',
    note: 'Array sorted.',
  })

  return frames
}

function buildSelectionTrace(seed: Term[]): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  for (let i = 0; i < terms.length - 1; i += 1) {
    let minIndex = i
    for (let j = i + 1; j < terms.length; j += 1) {
      frames.push({
        terms: cloneTerms(terms),
        pointer: minIndex,
        nextPointer: j,
        activeIds: [],
        action: 'compare',
        note: `Check if index ${j} is the new minimum.`,
      })
      if (terms[j].value < terms[minIndex].value) {
        minIndex = j
      }
    }

    if (minIndex !== i) {
      const leftId = terms[i].id
      const rightId = terms[minIndex].id
      ;[terms[i], terms[minIndex]] = [terms[minIndex], terms[i]]
      frames.push({
        terms: cloneTerms(terms),
        pointer: i,
        nextPointer: minIndex,
        activeIds: [leftId, rightId],
        action: 'swap',
        note: 'Move the smallest remaining value into place.',
      })
    }
  }

  frames.push({
    terms: cloneTerms(terms),
    pointer: terms.length - 2,
    nextPointer: terms.length - 1,
    activeIds: [],
    action: 'done',
    note: 'Array sorted.',
  })

  return frames
}

function buildInsertionTrace(seed: Term[]): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  for (let i = 1; i < terms.length; i += 1) {
    let j = i
    while (j > 0) {
      frames.push({
        terms: cloneTerms(terms),
        pointer: j - 1,
        nextPointer: j,
        activeIds: [],
        action: 'compare',
        note: 'Compare the current item to the sorted side.',
      })
      if (terms[j - 1].value <= terms[j].value) break

      const leftId = terms[j - 1].id
      const rightId = terms[j].id
      ;[terms[j - 1], terms[j]] = [terms[j], terms[j - 1]]
      frames.push({
        terms: cloneTerms(terms),
        pointer: j - 1,
        nextPointer: j,
        activeIds: [leftId, rightId],
        action: 'swap',
        note: 'Slide the smaller value left.',
      })
      j -= 1
    }
  }

  frames.push({
    terms: cloneTerms(terms),
    pointer: terms.length - 2,
    nextPointer: terms.length - 1,
    activeIds: [],
    action: 'done',
    note: 'Array sorted.',
  })

  return frames
}

function buildMergeTrace(seed: Term[]): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  function merge(left: number, mid: number, right: number) {
    const leftPart = cloneTerms(terms.slice(left, mid + 1))
    const rightPart = cloneTerms(terms.slice(mid + 1, right + 1))
    let i = 0
    let j = 0
    let k = left

    while (i < leftPart.length && j < rightPart.length) {
      frames.push({
        terms: cloneTerms(terms),
        pointer: left + i,
        nextPointer: mid + 1 + j,
        activeIds: [],
        action: 'compare',
        note: 'Compare the front values of the two sorted halves.',
      })

      if (leftPart[i].value <= rightPart[j].value) {
        terms[k] = { ...leftPart[i] }
        frames.push({
          terms: cloneTerms(terms),
          pointer: k,
          nextPointer: left + i,
          activeIds: [terms[k].id],
          action: 'swap',
          note: 'Copy the smaller front value into the merged section.',
        })
        i += 1
      } else {
        terms[k] = { ...rightPart[j] }
        frames.push({
          terms: cloneTerms(terms),
          pointer: k,
          nextPointer: mid + 1 + j,
          activeIds: [terms[k].id],
          action: 'swap',
          note: 'Copy the smaller front value into the merged section.',
        })
        j += 1
      }
      k += 1
    }

    while (i < leftPart.length) {
      terms[k] = { ...leftPart[i] }
      frames.push({
        terms: cloneTerms(terms),
        pointer: k,
        nextPointer: left + i,
        activeIds: [terms[k].id],
        action: 'swap',
        note: 'Copy the remaining left-half value.',
      })
      i += 1
      k += 1
    }

    while (j < rightPart.length) {
      terms[k] = { ...rightPart[j] }
      frames.push({
        terms: cloneTerms(terms),
        pointer: k,
        nextPointer: mid + 1 + j,
        activeIds: [terms[k].id],
        action: 'swap',
        note: 'Copy the remaining right-half value.',
      })
      j += 1
      k += 1
    }
  }

  function sort(left: number, right: number) {
    if (left >= right) return
    const mid = Math.floor((left + right) / 2)
    sort(left, mid)
    sort(mid + 1, right)
    merge(left, mid, right)
  }

  sort(0, terms.length - 1)
  frames.push({
    terms: cloneTerms(terms),
    pointer: terms.length - 2,
    nextPointer: terms.length - 1,
    activeIds: [],
    action: 'done',
    note: 'Array sorted.',
  })

  return frames
}

function buildQuickTrace(seed: Term[]): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  function partition(low: number, high: number) {
    const pivot = terms[high]
    let i = low

    for (let j = low; j < high; j += 1) {
      frames.push({
        terms: cloneTerms(terms),
        pointer: j,
        nextPointer: high,
        activeIds: [pivot.id],
        action: 'compare',
        note: 'Compare the current value to the pivot at the end.',
      })

      if (terms[j].value <= pivot.value) {
        const leftId = terms[i].id
        const rightId = terms[j].id
        ;[terms[i], terms[j]] = [terms[j], terms[i]]
        frames.push({
          terms: cloneTerms(terms),
          pointer: i,
          nextPointer: j,
          activeIds: [leftId, rightId],
          action: 'swap',
          note: 'Move a smaller value into the left partition.',
        })
        i += 1
      }
    }

    const leftId = terms[i].id
    const rightId = terms[high].id
    ;[terms[i], terms[high]] = [terms[high], terms[i]]
    frames.push({
      terms: cloneTerms(terms),
      pointer: i,
      nextPointer: high,
      activeIds: [leftId, rightId],
      action: 'swap',
      note: 'Place the pivot between the two partitions.',
    })
    return i
  }

  function sort(low: number, high: number) {
    if (low >= high) return
    const pivotIndex = partition(low, high)
    sort(low, pivotIndex - 1)
    sort(pivotIndex + 1, high)
  }

  sort(0, terms.length - 1)
  frames.push({
    terms: cloneTerms(terms),
    pointer: terms.length - 2,
    nextPointer: terms.length - 1,
    activeIds: [],
    action: 'done',
    note: 'Array sorted.',
  })

  return frames
}

function buildHeapTrace(seed: Term[]): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  function heapify(size: number, root: number) {
    let largest = root
    const left = 2 * root + 1
    const right = 2 * root + 2

    if (left < size) {
      frames.push({
        terms: cloneTerms(terms),
        pointer: root,
        nextPointer: left,
        activeIds: [],
        action: 'compare',
        note: 'Compare the root with its left child.',
      })
      if (terms[left].value > terms[largest].value) largest = left
    }

    if (right < size) {
      frames.push({
        terms: cloneTerms(terms),
        pointer: largest,
        nextPointer: right,
        activeIds: [],
        action: 'compare',
        note: 'Compare the current largest value with the right child.',
      })
      if (terms[right].value > terms[largest].value) largest = right
    }

    if (largest !== root) {
      const leftId = terms[root].id
      const rightId = terms[largest].id
      ;[terms[root], terms[largest]] = [terms[largest], terms[root]]
      frames.push({
        terms: cloneTerms(terms),
        pointer: root,
        nextPointer: largest,
        activeIds: [leftId, rightId],
        action: 'swap',
        note: 'Restore the max-heap property with a swap.',
      })
      heapify(size, largest)
    }
  }

  for (let i = Math.floor(terms.length / 2) - 1; i >= 0; i -= 1) {
    heapify(terms.length, i)
  }

  for (let end = terms.length - 1; end > 0; end -= 1) {
    const leftId = terms[0].id
    const rightId = terms[end].id
    ;[terms[0], terms[end]] = [terms[end], terms[0]]
    frames.push({
      terms: cloneTerms(terms),
      pointer: 0,
      nextPointer: end,
      activeIds: [leftId, rightId],
      action: 'swap',
      note: 'Move the max value to the sorted end of the array.',
    })
    heapify(end, 0)
  }

  frames.push({
    terms: cloneTerms(terms),
    pointer: terms.length - 2,
    nextPointer: terms.length - 1,
    activeIds: [],
    action: 'done',
    note: 'Array sorted.',
  })

  return frames
}

function buildLinearSearchTrace(seed: Term[], target: number): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  for (let i = 0; i < terms.length; i += 1) {
    frames.push({
      terms: cloneTerms(terms),
      pointer: i,
      nextPointer: -1,
      activeIds: [],
      action: 'compare',
      note: `Compare index ${i} to target ${target}.`,
    })

    if (terms[i].value === target) {
      frames.push({
        terms: cloneTerms(terms),
        pointer: i,
        nextPointer: -1,
        activeIds: [terms[i].id],
        action: 'found',
        note: `Target ${target} found at index ${i}.`,
      })
      return frames
    }
  }

  frames.push({
    terms: cloneTerms(terms),
    pointer: -1,
    nextPointer: -1,
    activeIds: [],
    action: 'done',
    note: `Target ${target} was not found.`,
  })
  return frames
}

function buildBinarySearchTrace(seed: Term[], target: number): TraceFrame[] {
  const terms = cloneTerms(seed).sort((a, b) => a.value - b.value)
  const frames: TraceFrame[] = []
  let low = 0
  let high = terms.length - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    frames.push({
      terms: cloneTerms(terms),
      pointer: mid,
      nextPointer: low === mid ? high : low,
      activeIds: [],
      action: 'compare',
      note: `Check the middle value at index ${mid}. Range: ${low}-${high}.`,
    })

    if (terms[mid].value === target) {
      frames.push({
        terms: cloneTerms(terms),
        pointer: mid,
        nextPointer: -1,
        activeIds: [terms[mid].id],
        action: 'found',
        note: `Target ${target} found at index ${mid}.`,
      })
      return frames
    }

    if (terms[mid].value < target) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  frames.push({
    terms: cloneTerms(terms),
    pointer: -1,
    nextPointer: -1,
    activeIds: [],
    action: 'done',
    note: `Target ${target} was not found.`,
  })

  return frames
}

const ALGORITHMS: AlgorithmOption[] = [
  {
    key: 'bubble',
    label: 'Bubble Sort',
    group: 'Sorting',
    description: 'Bubble sort repeatedly walks from left to right, comparing adjacent values and swapping them when they are out of order.',
    details: [
      'Each pass moves the largest unsorted value farther to the right.',
      'It is easy to trace visually because only neighboring bars interact.',
      'Students should notice how repeated local swaps eventually create global order.',
    ],
    code: `for (int pass = 0; pass < a.length - 1; pass++) {
  for (int j = 0; j < a.length - pass - 1; j++) {
    if (a[j] > a[j + 1]) swap(a, j, j + 1);
  }
}`,
    buildTrace: (seed) => buildBubbleTrace(seed),
  },
  {
    key: 'selection',
    label: 'Selection Sort',
    group: 'Sorting',
    description: 'Selection sort scans the unsorted part of the array, finds the smallest remaining value, and places it into the next sorted position.',
    details: [
      'The left side grows into a sorted region one index at a time.',
      'It does fewer swaps than bubble sort, but still makes many comparisons.',
      'Students should track the current minimum while the scan moves right.',
    ],
    code: `for (int i = 0; i < a.length - 1; i++) {
  int min = i;
  for (int j = i + 1; j < a.length; j++) {
    if (a[j] < a[min]) min = j;
  }
  swap(a, i, min);
}`,
    buildTrace: (seed) => buildSelectionTrace(seed),
  },
  {
    key: 'insertion',
    label: 'Insertion Sort',
    group: 'Sorting',
    description: 'Insertion sort builds a sorted left side by taking the next value and sliding it left until it reaches the correct spot.',
    details: [
      'This algorithm works well on small or nearly sorted arrays.',
      'The sorted prefix grows one item at a time from the left.',
      'Students should watch how one value shifts across several positions during insertion.',
    ],
    code: `for (int i = 1; i < a.length; i++) {
  int j = i;
  while (j > 0 && a[j - 1] > a[j]) {
    swap(a, j - 1, j);
    j--;
  }
    }`,
    buildTrace: (seed) => buildInsertionTrace(seed),
  },
  {
    key: 'merge',
    label: 'Merge Sort',
    group: 'Sorting',
    description: 'Merge sort splits the array into smaller pieces, sorts those pieces, and merges them back together in order.',
    details: [
      'It follows divide-and-conquer rather than repeated adjacent swaps.',
      'The important visual step is the merge, where two sorted halves are combined.',
      'Students should notice that the algorithm is fast because each level processes the array in orderly chunks.',
    ],
    code: `mergeSort(a, left, right) {
  int mid = (left + right) / 2;
  mergeSort(a, left, mid);
  mergeSort(a, mid + 1, right);
  merge(a, left, mid, right);
}`,
    buildTrace: (seed) => buildMergeTrace(seed),
  },
  {
    key: 'quick',
    label: 'Quick Sort',
    group: 'Sorting',
    description: 'Quick sort picks a pivot, partitions the array around it, and then recursively sorts the two sides.',
    details: [
      'Values smaller than the pivot move left, and larger values move right.',
      'Its speed often makes it a practical real-world choice.',
      'Students should focus on how the pivot ends each partition step in its final sorted position.',
    ],
    code: `quickSort(a, low, high) {
  int pivotIndex = partition(a, low, high);
  quickSort(a, low, pivotIndex - 1);
  quickSort(a, pivotIndex + 1, high);
}`,
    buildTrace: (seed) => buildQuickTrace(seed),
  },
  {
    key: 'heap',
    label: 'Heap Sort',
    group: 'Sorting',
    description: 'Heap sort first builds a max heap, then repeatedly moves the largest value to the end.',
    details: [
      'The array is treated like a binary tree stored in a list.',
      'Each removal places one more value into its final sorted position on the right.',
      'Students should watch how heapify restores parent-child order after each swap.',
    ],
    code: `buildMaxHeap(a);
for (int end = a.length - 1; end > 0; end--) {
  swap(a, 0, end);
  heapify(a, end, 0);
}`,
    buildTrace: (seed) => buildHeapTrace(seed),
  },
  {
    key: 'linear',
    label: 'Linear Search',
    group: 'Searching',
    description: 'Linear search checks each array value one by one until the target is found or the array ends.',
    details: [
      'It does not require the array to be sorted first.',
      'The pointer simply advances from left to right across every index.',
      'Students should compare this full scan to the faster narrowing used by binary search.',
    ],
    code: `for (int i = 0; i < a.length; i++) {
  if (a[i] == target) return i;
}
return -1;`,
    buildTrace: (seed, target) => buildLinearSearchTrace(seed, target),
  },
  {
    key: 'binary',
    label: 'Binary Search',
    group: 'Searching',
    description: 'Binary search looks at the middle value of a sorted array and cuts the search range in half after every comparison.',
    details: [
      'It only works correctly when the data is already sorted.',
      'The active range shrinks quickly because half the array is discarded each step.',
      'Students should focus on how low, high, and mid define the current search window.',
    ],
    code: `int low = 0, high = a.length - 1;
while (low <= high) {
  int mid = (low + high) / 2;
  if (a[mid] == target) return mid;
  if (a[mid] < target) low = mid + 1;
  else high = mid - 1;
}
return -1;`,
    buildTrace: (seed, target) => buildBinarySearchTrace(seed, target),
  },
]

function App() {
  const [algorithmKey, setAlgorithmKey] = useState<AlgorithmKey>('bubble')
  const [baseSeed, setBaseSeed] = useState<Term[]>(() => randomTerms(TERM_COUNT))
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speedMs, setSpeedMs] = useState(500)

  const algorithm = useMemo(
    () => ALGORITHMS.find((item) => item.key === algorithmKey) ?? ALGORITHMS[0],
    [algorithmKey],
  )

  const preparedSeed = useMemo(() => {
    if (algorithm.group === 'Searching') {
      return cloneTerms(baseSeed).sort((a, b) => a.value - b.value)
    }
    return baseSeed
  }, [algorithm.group, baseSeed])

  const target = useMemo(() => {
    const midIndex = Math.floor(preparedSeed.length / 2)
    return preparedSeed[midIndex]?.value ?? 0
  }, [preparedSeed])

  const frames = useMemo(() => algorithm.buildTrace(preparedSeed, target), [algorithm, preparedSeed, target])
  const frame = frames[frameIndex] ?? frames[frames.length - 1]

  useEffect(() => {
    setFrameIndex(0)
    setPlaying(false)
  }, [algorithmKey, baseSeed])

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

  const newData = () => setBaseSeed(randomTerms(TERM_COUNT))
  const reset = () => {
    setFrameIndex(0)
    setPlaying(false)
  }
  const stepForward = () => {
    setPlaying(false)
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
          <button onClick={newData}>New Data</button>
          <button onClick={reset}>Reset</button>
          <button onClick={stepForward}>Step</button>
          <button onClick={() => setPlaying((current) => !current)}>{playing ? 'Pause' : 'Play'}</button>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <div className="sidebar-title">Sorting</div>
          {ALGORITHMS.filter((item) => item.group === 'Sorting').map((item) => (
            <button
              key={item.key}
              type="button"
              className={`sidebar-item ${item.key === algorithmKey ? 'active' : ''}`}
              onClick={() => setAlgorithmKey(item.key)}
            >
              {item.label}
            </button>
          ))}
          <div className="sidebar-title section-break">Searching</div>
          {ALGORITHMS.filter((item) => item.group === 'Searching').map((item) => (
            <button
              key={item.key}
              type="button"
              className={`sidebar-item ${item.key === algorithmKey ? 'active' : ''}`}
              onClick={() => setAlgorithmKey(item.key)}
            >
              {item.label}
            </button>
          ))}
        </aside>

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
                const isPointer = index === frame.pointer
                const isNext = index === frame.nextPointer
                const isActive = frame.activeIds.includes(term.id)
                const stateClass = isActive ? 'is-moved' : isPointer ? 'is-pointer' : isNext ? 'is-next' : ''

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
                  const isPointer = index === frame.pointer
                  const isNext = index === frame.nextPointer
                  const isActive = frame.activeIds.includes(term.id)
                  const stateClass = isActive ? 'is-moved' : isPointer ? 'is-pointer' : isNext ? 'is-next' : ''

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

        <aside className="info">
          <div className="info-section">
            <div className="info-title">Frame</div>
            <p>
              {frameIndex + 1} / {frames.length}
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
              onChange={(event) => setSpeedMs(Number(event.target.value))}
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
      </section>
    </main>
  )
}

export default App
