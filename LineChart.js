import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ 
  data, 
  title = "Line Chart",
  margin = { top: 40, right: 30, bottom: 60, left: 60 },
  axisX = true,
  axisY = true,
  colorScheme = d3.schemeTableau10,
  dimensions,
  containerRef,
  fontConfig,
  animation = true,
  legend = true
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0 || !dimensions || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const keys = Object.keys(data[0]).slice(1);
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const x = d3.scalePoint()
      .domain(data.map(d => d.name))
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(keys, key => d[key]))]).nice()
      .range([innerHeight, 0]);

    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(colorScheme);

    const line = d3.line()
      .x(d => x(d.name))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add lines
    keys.forEach(key => {
      const lineData = data.map(d => ({ name: d.name, value: d[key] }));
      
      g.append('path')
        .datum(lineData)
        .attr('fill', 'none')
        .attr('stroke', color(key))
        .attr('stroke-width', 2)
        .attr('d', line)
        .style('transition', animation ? 'opacity 0.2s' : 'none')
        .on('mouseover', function(event, d) {
          d3.select(this).style('opacity', 0.8);
        })
        .on('mouseout', function(event, d) {
          d3.select(this).style('opacity', 1);
        });

      // Add dots
      g.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .attr('r', 3)
        .attr('fill', color(0))
        .style('transition', animation ? 'r 0.2s' : 'none')
        .on('mouseover', function(event, d) {
          d3.select(this).attr('r', 5);
        })
        .on('mouseout', function(event, d) {
          d3.select(this).attr('r', 3);
        });
    });

    // Add Y axis
    if (axisY) {
      g.append('g')
        .call(d3.axisLeft(y).tickFormat(d3.format(',.0f')))
        .style('color', 'var(--text-secondary)')
        .style('font-size', fontConfig?.size?.medium || '12px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.normal || 400);
    }

    // Add X axis
    if (axisX) {
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .style('color', 'var(--text-secondary)')
        .style('font-size', fontConfig?.size?.medium || '12px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.normal || 400);
    }

    // Add legend
    if (legend) {
      const legend = g.append('g')
        .attr('transform', `translate(0,${innerHeight + 20})`);

      legend.selectAll('rect')
        .data(keys)
        .join('rect')
          .attr('x', (d, i) => i * 120)
          .attr('y', 0)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', d => color(d))
          .attr('rx', 2);

      legend.selectAll('text')
        .data(keys)
        .join('text')
          .attr('x', (d, i) => i * 120 + 20)
          .attr('y', 10)
          .text(d => d.charAt(0).toUpperCase() + d.slice(1))
          .style('font-size', fontConfig?.size?.medium || '12px')
          .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
          .style('font-weight', fontConfig?.weight?.medium || 500)
          .style('fill', 'var(--text-secondary)');
    }

  }, [data, dimensions, margin, axisX, axisY, legend, colorScheme, fontConfig, animation]);

  return (
    <svg 
      ref={svgRef} 
      width={dimensions?.width || 0} 
      height={dimensions?.height || 0}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default LineChart; 