import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const StackedBarChart = ({
  data,
  margin = { top: 40, right: 30, bottom: 40, left: 50 },
  colorScheme = d3.schemeTableau10,
  dimensions,
  containerRef,
  fontConfig,
  groupAccessor = d => d.state,
  keysAccessor = d => d.age,
  valueAccessor = (d, key) => d.get(key).population,
  legend = true,
  axisX = true,
  axisY = true,
  labels = true,
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0 || !dimensions || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { top, right, bottom, left } = margin;
    
    // Calculate safe dimensions with proper padding
    const padding = 20;
    const adjustedMargin = {
      top: margin.top + padding,
      right: margin.right + padding,
      bottom: margin.bottom + padding,
      left: margin.left + padding
    };
    
    const innerWidth = Math.max(dimensions.width - adjustedMargin.left - adjustedMargin.right, 150);
    const innerHeight = Math.max(dimensions.height - adjustedMargin.top - adjustedMargin.bottom, 80);

    // Group and stack data
    const grouped = d3.index(data, groupAccessor, keysAccessor);
    const keys = d3.union(data.map(keysAccessor));
    const series = d3.stack()
      .keys(keys)
      .value(([, D], key) => {
        const value = valueAccessor(D, key);
        // console.log('valueAccessor called:', { 
        //   D, 
        //   key, 
        //   value, 
        //   DKeys: D ? Object.keys(D) : 'no D',
        //   DType: D ? typeof D : 'no D',
        //   DValues: D ? Array.from(D.values()) : 'no D',
        //   DEntries: D ? Array.from(D.entries()) : 'no D'
        // });
        return value;
      })(grouped);

    console.log('StackedBarChart Debug:', {
      data: data,
      grouped: grouped,
      keys: keys,
      keysType: typeof keys,
      keysIsArray: Array.isArray(keys),
      series: series,
      sampleData: data.slice(0, 3),
      groupAccessor: groupAccessor,
      keysAccessor: keysAccessor,
      valueAccessor: valueAccessor,
      sampleGroupAccessor: data.slice(0, 3).map(groupAccessor),
      sampleKeysAccessor: data.slice(0, 3).map(keysAccessor),
      firstDataItem: data[0],
      firstDataItemType: data[0] ? typeof data[0] : 'undefined',
      firstDataItemKeys: data[0] ? Object.keys(data[0]) : []
    });

    // X scale
    const x = d3.scaleBand()
      .domain(d3.groupSort(data, D => -d3.sum(D, d => valueAccessor(grouped.get(groupAccessor(d)), keysAccessor(d))), groupAccessor))
      .range([0, innerWidth])
      .padding(0.1);

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .rangeRound([innerHeight, 0]);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(colorScheme.length >= keys.length ? colorScheme : d3.schemeTableau10)
      .unknown('#ccc');

    const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en");

    // Create main group with proper transform and centering
    const verticalOffset = (dimensions.height - innerHeight) / 2;
    const g = svg.append('g')
      .attr('transform', `translate(${adjustedMargin.left},${verticalOffset})`);

    // Bars
    g.append('g')
      .selectAll('g')
      .data(series)
      .join('g')
        .attr('fill', d => color(d.key))
      .selectAll('rect')
      .data(D => D.map(d => (d.key = D.key, d)))
      .join('rect')
        .attr('x', d => x(d.data[0]))
        .attr('y', d => y(d[1]))
        .attr('height', d => {
          const height = y(d[0]) - y(d[1]);
          // console.log('Height calculation:', { d0: d[0], d1: d[1], height, isNaN: isNaN(height) });
          return isNaN(height) ? 0 : Math.max(0, height);
        })
        .attr('width', x.bandwidth())
      .append('title')
        .text(d => `${d.data[0]} ${d.key}\n${formatValue(valueAccessor(d.data[1], d.key))}`);

    // X Axis
    if (axisX) {
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(g => g.selectAll('text')
          .style('font-size', fontConfig?.size?.small || '10px')
          .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
          .style('fill', 'var(--text-secondary)'))
        .call(g => g.select('.domain').remove());
    }

    // Y Axis
    if (axisY) {
      g.append('g')
        .call(d3.axisLeft(y).ticks(null, 's'))
        .call(g => g.selectAll('text')
          .style('font-size', fontConfig?.size?.small || '10px')
          .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
          .style('fill', 'var(--text-secondary)'))
        .call(g => g.select('.domain').remove());
    }

    // Legend
    if (legend) {
      const legendG = svg.append('g')
        .attr('transform', `translate(${left},${top - 30})`);
      legendG.selectAll('rect')
        .data(keys)
        .join('rect')
          .attr('x', (d, i) => i * 100)
          .attr('y', 0)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', d => color(d))
          .attr('rx', 2);
      legendG.selectAll('text')
        .data(keys)
        .join('text')
          .attr('x', (d, i) => i * 100 + 18)
          .attr('y', 10)
          .text(d => d)
          .style('font-size', fontConfig?.size?.medium || '12px')
          .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
          .style('font-weight', fontConfig?.weight?.medium || 500)
          .style('fill', 'var(--text-secondary)');
    }

  }, [data, margin, colorScheme, dimensions, fontConfig, groupAccessor, keysAccessor, valueAccessor, legend, axisX, axisY]);

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

export default StackedBarChart; 