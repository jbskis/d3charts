import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Histogram = ({ 
  data, 
  margin = { top: 40, right: 30, bottom: 60, left: 60 },
  colorScheme = d3.schemeTableau10,
  dimensions,
  containerRef,
  fontConfig,
  animation = true,
  valueField = "value",
  thresholds = 40,
  axisX = true,
  axisY = true,
  legend = true
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

    // Extract values for binning
    const values = transformedData.map(d => d.value);

    // Bin the data
    const bins = d3.bin()
      .thresholds(thresholds)
      .value(d => d)
      (values);

    // Declare the x (horizontal position) scale
    const x = d3.scaleLinear()
      .domain([bins[0].x0, bins[bins.length - 1].x1])
      .range([0, width]);

    // Declare the y (vertical position) scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain([0, 1])
      .range(colorScheme);

    // Create the main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add bars for each bin
    g.append('g')
      .attr('fill', color(0))
      .selectAll('rect')
      .data(bins)
      .join('rect')
        .attr('x', d => x(d.x0) + 1)
        .attr('width', d => x(d.x1) - x(d.x0) - 1)
        .attr('height', d => y(d.length))
        .attr('rx', 2)
        .attr('ry', 2)
        .style('transition', animation ? 'opacity 0.2s' : 'none')
        .on('mouseover', function(event, d) {
          d3.select(this).style('opacity', 0.8);
        })
        .on('mouseout', function(event, d) {
          d3.select(this).style('opacity', 1);
        });

    // Add the x-axis
    if (axisX) {
      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
        .style('color', 'var(--text-secondary)')
        .style('font-size', fontConfig?.size?.medium || '12px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.normal || 400);
    }

    // Add the y-axis
    if (axisY) {
      g.append('g')
        .call(d3.axisLeft(y).ticks(height / 40))
        .call(g => g.select('.domain').remove())
        .style('color', 'var(--text-secondary)')
        .style('font-size', fontConfig?.size?.medium || '12px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.normal || 400);
    }

    // Add legend with statistics
    if (legend) {
      const stats = {
        count: values.length,
        mean: d3.mean(values),
        median: d3.median(values),
        min: d3.min(values),
        max: d3.max(values)
      };

      const legend = g.append('g')
        .attr('transform', `translate(0,${height + 20})`);

      // Add statistics text
      legend.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .text(`Count: ${stats.count} | Mean: ${stats.mean.toFixed(1)} | Median: ${stats.median.toFixed(1)} | Range: ${stats.min.toFixed(1)}-${stats.max.toFixed(1)}`)
        .style('font-size', fontConfig?.size?.small || '10px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.medium || 500)
        .style('fill', 'var(--text-secondary)');
    }

  }, [data, dimensions, margin, axisX, axisY, legend, colorScheme, valueField, thresholds, fontConfig, animation]);

  return (
    <svg 
      ref={svgRef} 
      width={dimensions?.width || 0} 
      height={dimensions?.height || 0}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default Histogram; 