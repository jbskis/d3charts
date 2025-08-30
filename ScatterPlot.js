import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({
  data,
  margin = { top: 40, right: 30, bottom: 40, left: 50 },
  colorScheme = d3.schemeTableau10,
  dimensions,
  containerRef,
  fontConfig,
  xAccessor = d => d.x,
  yAccessor = d => d.y,
  radius = 3,
  title = null,
  axisX = true,
  axisY = true,
  xLabel,
  yLabel,
  xFormat,
  yFormat,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 1.5,
  halo = "#fff",
  haloWidth = 3,
  labels = true,
  animation = true
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0 || !dimensions || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { top, right, bottom, left } = margin;
    const innerWidth = dimensions.width - left - right;
    const innerHeight = dimensions.height - top - bottom;

    // Extract data
    const X = data.map(xAccessor);
    const Y = data.map(yAccessor);
    const T = title && typeof title === 'function' ? data.map(title) : null;
    const I = d3.range(X.length).filter(i => !isNaN(X[i]) && !isNaN(Y[i]));

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(X))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(Y))
      .range([innerHeight, 0]);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(d3.range(data.length))
      .range(colorScheme);

    // Create main group with proper transform
    const g = svg.append('g')
      .attr('transform', `translate(${left},${top})`);

    // Grid lines
    g.append('g')
      .attr('stroke', 'var(--border-subtle)')
      .attr('stroke-opacity', 0.1)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat('')
        .ticks(5));

    g.append('g')
      .attr('stroke', 'var(--border-subtle)')
      .attr('stroke-opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat('')
        .ticks(5));

    // X Axis
    if (axisX) {
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(Math.max(4, Math.floor(innerWidth / 80))))
        .call(g => g.selectAll('text')
          .style('font-size', fontConfig?.size?.small || '10px')
          .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
          .style('fill', 'var(--text-secondary)'))
        .call(g => g.select('.domain').remove());
    }

    // Y Axis
    if (axisY) {
      g.append('g')
        .call(d3.axisLeft(yScale).ticks(Math.max(4, Math.floor(innerHeight / 50))))
        .call(g => g.selectAll('text')
          .style('font-size', fontConfig?.size?.small || '10px')
          .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
          .style('fill', 'var(--text-secondary)'))
        .call(g => g.select('.domain').remove());
    }

    // Axis labels
    if (xLabel) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 35)
        .attr('text-anchor', 'middle')
        .style('font-size', fontConfig?.size?.medium || '12px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.medium || 500)
        .style('fill', 'var(--text-secondary)')
        .text(xLabel);
    }

    if (yLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -35)
        .attr('text-anchor', 'middle')
        .style('font-size', fontConfig?.size?.medium || '12px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.medium || 500)
        .style('fill', 'var(--text-secondary)')
        .text(yLabel);
    }

    // Points
    g.append('g')
      .attr('fill', fill)
      .attr('stroke', stroke)
      .attr('stroke-width', strokeWidth)
      .selectAll('circle')
      .data(I)
      .join('circle')
      .attr('cx', i => xScale(X[i]))
      .attr('cy', i => yScale(Y[i]))
      .attr('r', radius)
      .attr('fill', (d, i) => color(i))
      .style('transition', animation ? 'opacity 0.2s' : 'none')
      .on('mouseover', function(event, d) {
        d3.select(this).style('opacity', 0.8);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).style('opacity', 1);
      });

    // Labels
    if (T && labels) {
      g.append('g')
        .attr('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .attr('font-size', fontConfig?.size?.small || '10px')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .selectAll('text')
        .data(I)
        .join('text')
        .attr('dx', 7)
        .attr('dy', '0.35em')
        .attr('x', i => xScale(X[i]))
        .attr('y', i => yScale(Y[i]))
        .text(i => T[i])
        .style('fill', 'var(--text-primary)')
        .style('font-weight', fontConfig?.weight?.medium || 500)
        .call(text => text.clone(true)
          .attr('fill', 'none')
          .attr('stroke', halo)
          .attr('stroke-width', haloWidth));

    }

  }, [data, margin, colorScheme, dimensions, fontConfig, xAccessor, yAccessor, radius, title, axisX, axisY, xLabel, yLabel, xFormat, yFormat, fill, stroke, strokeWidth, halo, haloWidth, labels, animation]);

  return (
    <svg
      ref={svgRef}
      width={dimensions?.width || 0}
      height={dimensions?.height || 0}
      style={{ 
        width: '100%', 
        height: '100%', 
        maxHeight: '100%', 
        overflow: 'visible' 
      }}
    />
  );
};

export default ScatterPlot; 