import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ProgressCircle = ({ 
  data, 
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  colorScheme = ['#4299e1', '#48bb78', '#ed8936', '#f56565', '#9f7aea'],
  valueField = "value",
  maxValue = 100,
  startAngle = Math.PI / 2, // Start from top
  strokeWidth = 7,
  dimensions,
  containerRef,
  fontConfig,
  animation = true
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0 || !dimensions || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;
    const outerRadius = radius - 10;
    const innerRadius = outerRadius - strokeWidth; // Use strokeWidth directly

    // Create the main group and center it in the full container
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const g = svg.append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Transform data if needed (handle different data formats)
    let transformedData = data;
    
    // If data has 'name' field instead of 'value', transform it
    if (data[0] && data[0].name && !data[0].value) {
      transformedData = data.map(d => ({
        value: d[valueField] || Object.values(d).filter(v => typeof v === 'number')[0] || 0
      }));
    }
    
    // If data has multiple numeric fields, use the first one
    if (data[0] && Object.keys(data[0]).some(key => typeof data[0][key] === 'number' && key !== 'name')) {
      const numericKeys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number' && key !== 'name');
      if (numericKeys.length > 1) {
        transformedData = numericKeys.map(key => ({
          value: d3.sum(data, d => d[key])
        }));
      }
    }

    // Get the progress value (use first value if array, or single value)
    const progressValue = Array.isArray(transformedData) ? transformedData[0]?.value || 0 : transformedData?.value || 0;
    const progressPercentage = Math.min(progressValue / maxValue, 1);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain([0, 1])
      .range(colorScheme);

    // Arc generator
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(5);

    // Background arc (full circle)
    g.append('path')
      .attr('d', arc({ startAngle: 0, endAngle: 2 * Math.PI }))
      .attr('fill', 'var(--border-color)')
      .attr('opacity', 0.2);

    // Progress arc
    const progressArc = g.append('path')
      .attr('d', arc({ startAngle: startAngle, endAngle: startAngle + (2 * Math.PI * progressPercentage) }))
      .attr('fill', color(0))
      .style('transition', animation ? 'all 0.8s ease' : 'none')
      .on('mouseover', function() {
        if (animation) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8);
        } else {
          d3.select(this).attr('opacity', 0.8);
        }
      })
      .on('mouseout', function() {
        if (animation) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1);
        } else {
          d3.select(this).attr('opacity', 1);
        }
      });

    // Add value text in center
    const textGroup = g.append('g')
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none');

    // Check if there's a label
    const hasLabel = data[0]?.label && data[0].label !== null;
    
    // Calculate font sizes
    const baseFontSize = fontConfig?.size?.xlarge || '24px';
    const baseSize = parseInt(baseFontSize);
    const largerSize = Math.round(baseSize * 1.5);

    // Main value
    textGroup.append('text')
      .attr('dy', hasLabel ? '-0.2em' : '0.35em') // Center vertically if no label
      .style('font-size', hasLabel ? baseFontSize : `${largerSize}px`) // 50% larger if no label
      .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
      .style('font-weight', fontConfig?.weight?.bold || 700)
      .style('fill', 'var(--text-primary)')
      .text(Math.round(progressValue));

    // Optional label
    if (hasLabel) {
      textGroup.append('text')
        .attr('dy', '1em')
        .style('font-size', fontConfig?.size?.medium || '12px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.medium || 500)
        .style('fill', 'var(--text-secondary)')
        .text(data[0].label);
    }

  }, [data, dimensions, margin, colorScheme, valueField, maxValue, fontConfig, startAngle, strokeWidth, animation]);

  return (
    <svg 
      ref={svgRef} 
      width={dimensions?.width || 0} 
      height={dimensions?.height || 0}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default ProgressCircle; 