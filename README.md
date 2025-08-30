# D3 Chart Components

A collection of reusable D3.js chart components for React applications. An abstract of d3 charts in react through a common component. Working on data normalization and will update.

## Components

- **D3Chart.js** - Main chart wrapper component
- **GroupedBarChart.js** - Grouped bar chart
- **HexChart.js** - Hexagonal chart
- **Histogram.js** - Histogram chart
- **Icicle.js** - Icicle chart
- **LineChart.js** - Line chart
- **ParallelSets.js** - Parallel sets chart
- **PieChart.js** - Pie chart
- **PieDonut.js** - Donut chart
- **ProgressCircle.js** - Progress circle
- **ScatterPlot.js** - Scatter plot
- **StackedBarChart.js** - Stacked bar chart
- **TreeMap.js** - Treemap chart

## CSS Styles

The components require specific CSS classes for proper styling. Include the SCSS files in your project:

```scss
@import 'styles/main.scss';
```

### Key CSS Classes

- `.chart-container` - Main chart container
- `.frosted-panel` - Glassmorphism panel styling
- `.size-*` - Size classes (small, medium, large, xlarge, full)
- `.chart-grid` - Grid layout for multiple charts
- `.chart-title` - Chart title styling

### Theme Support

The components support both light and dark themes through CSS custom properties. The styles automatically adapt based on the `body.light` or `body.dark` classes.

## Usage

These components are designed to work with React and D3.js. Each component accepts data and configuration props to render various types of charts.

### Example

```jsx
import { D3Chart } from './D3Chart';

<D3Chart
  type="line"
  data={chartData}
  size="large"
  panelClass="sky"
  title="My Chart"
/>
```

## License

MIT
