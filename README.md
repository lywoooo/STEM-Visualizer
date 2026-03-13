# STEM Visualizer

A classroom-friendly algorithm visualizer built with React and Vite. It shows algorithms in two synchronized ways:

- a bar graph for visual motion and magnitude
- an array view for exact values and indices

The goal is simple: make algorithm behavior easier to teach and easier to understand.

## Preview

### Website

![STEM Visualizer home screen](./docs/media/website-full.png)

## Features

- Clean sidebar for switching between algorithms
- Animated bar graph with color-coded comparisons
- Large array view under the graph for direct index/value tracking
- Step, play, reset, and new data controls
- Built-in descriptions and pseudocode for each algorithm

## Algorithms Included

### Sorting

- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort
- Heap Sort

### Searching

- Linear Search
- Binary Search

## Teaching Notes

Each algorithm includes a short explanation panel that helps students focus on what matters:

- what the pointer is currently looking at
- what value is being compared next
- what values changed position
- how the algorithm’s strategy works over time

Color meanings in the visualizer:

- Yellow: current pointer or active item
- Blue: item being compared
- Red: item that was moved or marked by the current step

## Interface

- Left sidebar: choose a sorting or searching algorithm
- Center panel: see the live bar graph and array view
- Right panel: read the explanation, target value, and reference code

## Why This Project Stands Out

- It uses one consistent visual system across both sorting and searching algorithms, so students can focus on strategy instead of relearning the interface.
- Every algorithm is shown in two synchronized forms: animated bars for intuition and a large indexed array for exact reasoning.
- The visualization is built from explicit trace frames such as compare, swap, found, and done, which makes each step teachable instead of decorative.
- It goes beyond basic AP CSA coverage by including advanced algorithms like Merge Sort, Quick Sort, and Heap Sort in the same learning environment.
- Search algorithms are handled differently where needed, including sorted preparation for Binary Search and target-focused tracing.
- The app is designed for instruction, not just animation, with explanation text, teaching notes, and readable pseudocode beside each algorithm.
- The bar motion is stateful and smooth because values keep stable identities as they move through the array.
- The project stays lightweight and readable despite the algorithm coverage, using a small React and Vite codebase instead of a large visualization framework.
