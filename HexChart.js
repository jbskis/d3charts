import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { hexbin as d3Hexbin } from 'd3-hexbin';

const HexChart = ({
  data,
  radius = 30,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  colorScheme = d3.schemeTableau10,
  dimensions,
  containerRef,
  fontConfig,
  axisX = false,
  axisY = false,
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !dimensions || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Calculate hex grid layout
    const hexbin = d3Hexbin()
      .radius(radius)
      .extent([[0, 0], [width, height]]);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(data.map((d, i) => i))
      .range(colorScheme);

    // X and Y scales for axes
    const xExtent = d3.extent(data, d => d.x);
    const yExtent = d3.extent(data, d => d.y);
    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([0, width]);
    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([height, 0]);

    // Create the main group and center it
    const offsetX = (dimensions.width - width) / 2;
    const offsetY = (dimensions.height - height) / 2;
    const g = svg.append('g')
      .attr('transform', `translate(${offsetX},${offsetY})`);

    // Draw axes if enabled
    if (axisX) {
      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(Math.max(4, Math.floor(width / 80))))
        .call(g => g.selectAll('text')
          .style('font-size', fontConfig?.size?.small || '10px')
          .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
          .style('fill', 'var(--text-secondary)'));
    }
    if (axisY) {
      g.append('g')
        .attr('transform', `translate(0,0)`)
        .call(d3.axisLeft(yScale).ticks(Math.max(4, Math.floor(height / 50))))
        .call(g => g.selectAll('text')
          .style('font-size', fontConfig?.size?.small || '10px')
          .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
          .style('fill', 'var(--text-secondary)'));
    }

    // Generate hexbin points
    const points = data.map(d => [d.x, d.y, d.value, d.label]);
    const bins = hexbin(points);

    // Draw hexagons
    g.append('g')
      .selectAll('path')
      .data(bins)
      .join('path')
        .attr('d', hexbin.hexagon())
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .attr('fill', (d, i) => color(i))
        .attr('fill-opacity', 0.7)
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .on('mouseover', function() {
          d3.select(this).attr('fill-opacity', 1);
        })
        .on('mouseout', function() {
          d3.select(this).attr('fill-opacity', 0.7);
        });

    // Add labels (value) in the center of each hex
    g.append('g')
      .selectAll('text')
      .data(bins)
      .join('text')
        .attr('x', d => d.x)
        .attr('y', d => d.y + 4)
        .attr('text-anchor', 'middle')
        .style('font-size', fontConfig?.size?.small || '10px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.bold || 700)
        .style('fill', 'white')
        .text(d => d[0][2]); // value

    // Optionally add label below value
    g.append('g')
      .selectAll('text.label')
      .data(bins)
      .join('text')
        .attr('class', 'label')
        .attr('x', d => d.x)
        .attr('y', d => d.y + radius / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', fontConfig?.size?.small || '10px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.medium || 500)
        .style('fill', 'var(--text-secondary)')
        .text(d => d[0][3] || ''); // label

  }, [data, radius, dimensions, margin, colorScheme, fontConfig, axisX, axisY]);

  return (
    <svg
      ref={svgRef}
      width={dimensions?.width || 0}
      height={dimensions?.height || 0}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default HexChart; 