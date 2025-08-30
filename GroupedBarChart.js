import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GroupedBarChart = ({ 
  data, 
  title = "Revenue by Category",
  margin = { top: 40, right: 30, bottom: 60, left: 60 },
  axisX = true,
  axisY = true,
  colorScheme = d3.schemeTableau10,
  dimensions,
  containerRef,
  fontConfig,
  animation = true
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0 || !dimensions || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const titleHeight = 40;
    const axisHeight = axisX ? 30 : 0;
    const padding = 20;

    const adjustedMargin = {
      top: margin.top,
      right: margin.right,
      bottom: axisX ? margin.bottom : 20,
      left: axisY ? margin.left : 0
    };

    const safeHeight = Math.max(dimensions.height - adjustedMargin.top - adjustedMargin.bottom - titleHeight, 80);
    const availableWidth = dimensions.width - adjustedMargin.left - adjustedMargin.right;
    const innerHeight = safeHeight;
    const innerWidth = Math.max(availableWidth, 150);

    let chartTransform;
    if (!axisY) {
      const availableWidth = dimensions.width - adjustedMargin.right;
      const leftOffset = (availableWidth - innerWidth) / 2;
      const verticalOffset = (dimensions.height - innerHeight) / 2;
      chartTransform = `translate(${leftOffset},${verticalOffset})`;
    } else {
      const verticalOffset = (dimensions.height - innerHeight) / 2;
      chartTransform = `translate(${adjustedMargin.left},${verticalOffset})`;
    }

    const g = svg.append('g')
      .attr('transform', chartTransform);

    const keys = Object.keys(data[0]).slice(1);

    const x0 = d3.scaleBand()
      .domain(data.map(d => d.name))
      .rangeRound([0, innerWidth])
      .paddingInner(0.1);

    const x1 = d3.scaleBand()
      .domain(keys)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(keys, key => d[key]))]).nice()
      .range([innerHeight, 0]);

    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(colorScheme);

    g.append('g')
      .selectAll('g')
      .data(data)
      .join('g')
        .attr('transform', d => `translate(${x0(d.name)},0)`)
      .selectAll('rect')
      .data(d => keys.map(key => ({ key, value: d[key] })))
      .join('rect')
        .attr('x', d => x1(d.key))
        .attr('y', d => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', d => innerHeight - y(d.value))
        .attr('fill', d => color(d.key))
        .attr('rx', 2)
        .attr('ry', 2)
        .style('transition', animation ? 'opacity 0.2s' : 'none')
        .on('mouseover', function(event, d) {
          d3.select(this).style('opacity', 0.8);
        })
        .on('mouseout', function(event, d) {
          d3.select(this).style('opacity', 1);
        });

    if (axisY) {
      g.append('g')
        .call(d3.axisLeft(y).tickFormat(d3.format(',.0f')))
        .style('color', 'var(--text-secondary)')
        .style('font-size', fontConfig?.size?.medium || '12px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.normal || 400);
    }

    if (axisX) {
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x0))
        .style('color', 'var(--text-secondary)')
        .style('font-size', fontConfig?.size?.medium || '12px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.normal || 400);
    }

  }, [data, dimensions, margin, axisX, axisY, colorScheme, fontConfig, animation]);

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

export default GroupedBarChart;
