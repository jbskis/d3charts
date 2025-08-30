import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import GroupedBarChart from './GroupedBarChart';
import LineChart from './LineChart';
import PieChart from './PieChart';
import PieDonut from './PieDonut';
import ParallelSets from './ParallelSets';
import ProgressCircle from './ProgressCircle';
import Histogram from './Histogram';
import TreeMap from './TreeMap';
import Icicle from './Icicle';
import HexChart from './HexChart';
import StackedBarChart from './StackedBarChart';
import ScatterPlot from './ScatterPlot';


const D3Chart = ({
  type = 'grouped-bar',
  data,
  title = "Chart",
  size = 'small',
  margin = { top: 40, right: 30, bottom: 60, left: 60 },
  axisX = true,
  axisY = true,
  legend = true,
  labels = true,
  panelClass = null,
  colorScheme = d3.schemeTableau10,
  animation = true,
  ...rest
}) => {
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // D3 font configuration
  const fontConfig = {
    family: 'Space Grotesk, sans-serif',
    size: {
      small: '10px',
      medium: '12px',
      large: '14px',
      xlarge: '24px',
      title: '16px'
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };

  // Resize observer to detect container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;
      
      // Force a layout calculation to ensure we get accurate dimensions
      const rect = container.getBoundingClientRect();
      let width = rect.width || container.offsetWidth || 0;
      let height = rect.height || container.offsetHeight || 0;
      
      // If no height is set, calculate based on parent or set a minimum
      if (height === 0) {
        const parent = container.parentElement;
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          height = parentRect.height * 0.8; // 80% of parent height
        } else {
          height = 300; // Fallback minimum height
        }
      }
      
      // Only update if we have valid dimensions
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    };

    // Initial size calculation - always do this regardless of animation setting
    updateDimensions();
    
    // For non-animated charts, ensure we get the full dimensions after the next frame
    if (!animation) {
      // Try multiple times to ensure we get the full dimensions
      const checkDimensions = () => {
        updateDimensions();
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            // If still no dimensions, try again after a short delay
            setTimeout(checkDimensions, 10);
          }
        }
      };
      
      requestAnimationFrame(checkDimensions);
    }

    // Only set up ResizeObserver if animations are enabled
    if (animation) {
      // Create ResizeObserver to watch for size changes
      const resizeObserver = new ResizeObserver(() => {
        if (containerRef.current) {
          updateDimensions();
        }
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      // Also listen for window resize
      const handleWindowResize = () => {
        updateDimensions();
      };
      window.addEventListener('resize', handleWindowResize);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleWindowResize);
      };
    } else {
      // When animations are disabled, only update on window resize with debouncing
      let resizeTimeout;
      const handleWindowResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          updateDimensions();
        }, 100); // Debounce resize events
      };
      
      window.addEventListener('resize', handleWindowResize);
      
      return () => {
        clearTimeout(resizeTimeout);
        window.removeEventListener('resize', handleWindowResize);
      };
    }
  }, [animation]);

  const chartProps = {
    data,
    title,
    margin,
    axisX,
    axisY,
    legend,
    colorScheme,
    dimensions,
    containerRef,
    fontConfig,
    labels,
    animation,
    ...rest,
  };

  const getChart = () => {
    switch (type) {
      case 'grouped-bar':
        return <GroupedBarChart {...chartProps} />;
      case 'line':
        return <LineChart {...chartProps} />;
      case 'pie':
        return <PieChart {...chartProps} />;
      case 'pie-donut':
        return <PieDonut {...chartProps} />;
      case 'parallel-sets':
        return <ParallelSets {...chartProps} />;
      case 'progress-circle':
        return <ProgressCircle {...chartProps} />;
      case 'histogram':
        return <Histogram {...chartProps} />;
      case 'tree-map':
        return <TreeMap {...chartProps} />;
      case 'icicle':
        return <Icicle {...chartProps} />;
      case 'hex-chart':
        return <HexChart {...chartProps} />;
      case 'stacked-bar':
        return <StackedBarChart {...chartProps} />;
      case 'scatter-plot':
        return <ScatterPlot {...chartProps} />;
      default:
        return (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Unsupported chart type: {type}
          </div>
        );
    }
  };

  return (
    <div 
      className={`chart-container frosted-panel size-${size} ${panelClass ? `${panelClass}` : ''}`} 
      ref={containerRef}
      style={!animation ? { 
        minHeight: '300px', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      } : {}}
    >
      <div className="chart-title" style={{ fontFamily: fontConfig.family }}>{title}</div>
      {getChart()}
    </div>
  );
};

export default D3Chart;
