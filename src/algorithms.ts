import type { AlgorithmOption, Term, TraceFrame } from './types'
import { cloneTerms, createDoneFrame, createFrame } from './utils'

function buildBubbleTrace(seed: Term[]): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  for (let pass = 0; pass < terms.length - 1; pass += 1) {
    let swapped = false

    for (let index = 0; index < terms.length - pass - 1; index += 1) {
      frames.push(createFrame(terms, index, index + 1, 'compare', `Compare index ${index} with ${index + 1}.`))

      if (terms[index].value > terms[index + 1].value) {
        const activeIds = [terms[index].id, terms[index + 1].id]
        ;[terms[index], terms[index + 1]] = [terms[index + 1], terms[index]]
        frames.push(createFrame(terms, index, index + 1, 'swap', 'Swap the adjacent pair.', activeIds))
        swapped = true
      }
    }

    if (!swapped) break
  }

  frames.push(createDoneFrame(terms))
  return frames
}

function buildSelectionTrace(seed: Term[]): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  for (let start = 0; start < terms.length - 1; start += 1) {
    let minIndex = start

    for (let index = start + 1; index < terms.length; index += 1) {
      frames.push(createFrame(terms, minIndex, index, 'compare', `Check if index ${index} is the new minimum.`))
      if (terms[index].value < terms[minIndex].value) {
        minIndex = index
      }
    }

    if (minIndex !== start) {
      const activeIds = [terms[start].id, terms[minIndex].id]
      ;[terms[start], terms[minIndex]] = [terms[minIndex], terms[start]]
      frames.push(createFrame(terms, start, minIndex, 'swap', 'Move the smallest remaining value into place.', activeIds))
    }
  }

  frames.push(createDoneFrame(terms))
  return frames
}

function buildInsertionTrace(seed: Term[]): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  for (let index = 1; index < terms.length; index += 1) {
    let pointer = index

    while (pointer > 0) {
      frames.push(createFrame(terms, pointer - 1, pointer, 'compare', 'Compare the current item to the sorted side.'))
      if (terms[pointer - 1].value <= terms[pointer].value) break

      const activeIds = [terms[pointer - 1].id, terms[pointer].id]
      ;[terms[pointer - 1], terms[pointer]] = [terms[pointer], terms[pointer - 1]]
      frames.push(createFrame(terms, pointer - 1, pointer, 'swap', 'Slide the smaller value left.', activeIds))
      pointer -= 1
    }
  }

  frames.push(createDoneFrame(terms))
  return frames
}

function buildMergeTrace(seed: Term[]): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  function merge(left: number, mid: number, right: number) {
    const leftPart = cloneTerms(terms.slice(left, mid + 1))
    const rightPart = cloneTerms(terms.slice(mid + 1, right + 1))
    let leftCursor = 0
    let rightCursor = 0
    let writeIndex = left

    while (leftCursor < leftPart.length && rightCursor < rightPart.length) {
      frames.push(
        createFrame(
          terms,
          left + leftCursor,
          mid + 1 + rightCursor,
          'compare',
          'Compare the front values of the two sorted halves.',
        ),
      )

      const takeLeft = leftPart[leftCursor].value <= rightPart[rightCursor].value
      const sourceIndex = takeLeft ? left + leftCursor : mid + 1 + rightCursor
      const nextTerm = takeLeft ? leftPart[leftCursor++] : rightPart[rightCursor++]
      terms[writeIndex] = { ...nextTerm }
      frames.push(
        createFrame(
          terms,
          writeIndex,
          sourceIndex,
          'swap',
          'Copy the smaller front value into the merged section.',
          [terms[writeIndex].id],
        ),
      )
      writeIndex += 1
    }

    while (leftCursor < leftPart.length) {
      terms[writeIndex] = { ...leftPart[leftCursor] }
      frames.push(createFrame(terms, writeIndex, left + leftCursor, 'swap', 'Copy the remaining left-half value.', [terms[writeIndex].id]))
      leftCursor += 1
      writeIndex += 1
    }

    while (rightCursor < rightPart.length) {
      terms[writeIndex] = { ...rightPart[rightCursor] }
      frames.push(createFrame(terms, writeIndex, mid + 1 + rightCursor, 'swap', 'Copy the remaining right-half value.', [terms[writeIndex].id]))
      rightCursor += 1
      writeIndex += 1
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
  frames.push(createDoneFrame(terms))
  return frames
}

function buildQuickTrace(seed: Term[]): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  function partition(low: number, high: number) {
    const pivot = terms[high]
    let boundary = low

    for (let index = low; index < high; index += 1) {
      frames.push(createFrame(terms, index, high, 'compare', 'Compare the current value to the pivot at the end.', [pivot.id]))

      if (terms[index].value <= pivot.value) {
        const activeIds = [terms[boundary].id, terms[index].id]
        ;[terms[boundary], terms[index]] = [terms[index], terms[boundary]]
        frames.push(createFrame(terms, boundary, index, 'swap', 'Move a smaller value into the left partition.', activeIds))
        boundary += 1
      }
    }

    const activeIds = [terms[boundary].id, terms[high].id]
    ;[terms[boundary], terms[high]] = [terms[high], terms[boundary]]
    frames.push(createFrame(terms, boundary, high, 'swap', 'Place the pivot between the two partitions.', activeIds))
    return boundary
  }

  function sort(low: number, high: number) {
    if (low >= high) return
    const pivotIndex = partition(low, high)
    sort(low, pivotIndex - 1)
    sort(pivotIndex + 1, high)
  }

  sort(0, terms.length - 1)
  frames.push(createDoneFrame(terms))
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
      frames.push(createFrame(terms, root, left, 'compare', 'Compare the root with its left child.'))
      if (terms[left].value > terms[largest].value) largest = left
    }

    if (right < size) {
      frames.push(createFrame(terms, largest, right, 'compare', 'Compare the current largest value with the right child.'))
      if (terms[right].value > terms[largest].value) largest = right
    }

    if (largest !== root) {
      const activeIds = [terms[root].id, terms[largest].id]
      ;[terms[root], terms[largest]] = [terms[largest], terms[root]]
      frames.push(createFrame(terms, root, largest, 'swap', 'Restore the max-heap property with a swap.', activeIds))
      heapify(size, largest)
    }
  }

  for (let index = Math.floor(terms.length / 2) - 1; index >= 0; index -= 1) {
    heapify(terms.length, index)
  }

  for (let end = terms.length - 1; end > 0; end -= 1) {
    const activeIds = [terms[0].id, terms[end].id]
    ;[terms[0], terms[end]] = [terms[end], terms[0]]
    frames.push(createFrame(terms, 0, end, 'swap', 'Move the max value to the sorted end of the array.', activeIds))
    heapify(end, 0)
  }

  frames.push(createDoneFrame(terms))
  return frames
}

function buildLinearSearchTrace(seed: Term[], target: number): TraceFrame[] {
  const terms = cloneTerms(seed)
  const frames: TraceFrame[] = []

  for (let index = 0; index < terms.length; index += 1) {
    frames.push(createFrame(terms, index, -1, 'compare', `Compare index ${index} to target ${target}.`))
    if (terms[index].value === target) {
      frames.push(createFrame(terms, index, -1, 'found', `Target ${target} found at index ${index}.`, [terms[index].id]))
      return frames
    }
  }

  frames.push(createFrame(terms, -1, -1, 'done', `Target ${target} was not found.`))
  return frames
}

function buildBinarySearchTrace(seed: Term[], target: number): TraceFrame[] {
  const terms = cloneTerms(seed).sort((left, right) => left.value - right.value)
  const frames: TraceFrame[] = []
  let low = 0
  let high = terms.length - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    frames.push(createFrame(terms, mid, low === mid ? high : low, 'compare', `Check the middle value at index ${mid}. Range: ${low}-${high}.`))

    if (terms[mid].value === target) {
      frames.push(createFrame(terms, mid, -1, 'found', `Target ${target} found at index ${mid}.`, [terms[mid].id]))
      return frames
    }

    if (terms[mid].value < target) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  frames.push(createFrame(terms, -1, -1, 'done', `Target ${target} was not found.`))
  return frames
}

export const ALGORITHMS: AlgorithmOption[] = [
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
