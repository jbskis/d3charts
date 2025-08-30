import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ParallelSets = ({ 
  data, 
  title = "Claims Flow Analysis",
  margin = { top: 40, right: 30, bottom: 60, left: 30 },
  axisX = true,
  axisY = true,
  legend = true,
  colorScheme = d3.schemeTableau10,
  dimensions,
  fontConfig
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.length || !dimensions?.width || !dimensions?.height) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Adjust margins based on axis visibility
    const adjustedMargin = {
      top: margin.top,
      right: margin.right,
      bottom: axisX ? margin.bottom : 20, // Minimal bottom margin for legend
      left: axisY ? margin.left : 0 // No left margin when Y-axis is off
    };

    const width = dimensions.width;
    const height = dimensions.height;
    const innerWidth = width - adjustedMargin.left - adjustedMargin.right;
    const innerHeight = height - adjustedMargin.top - adjustedMargin.bottom;

    const dataDimensions = Object.keys(data[0]).filter(d => d !== 'value');
    
    // Use full width when Y-axis is off, otherwise use innerWidth
    const scaleWidth = !axisY ? (width - adjustedMargin.right) : innerWidth;
    const x = d3.scalePoint().domain(dataDimensions).range([0, scaleWidth]).padding(0.3);
    const color = d3.scaleOrdinal(d3.union(data.map(d => d[dataDimensions[0]])), colorScheme);

    // Compute total value per dimension/category to determine band position
    const yStacks = {};
    dataDimensions.forEach(dim => {
      const grouped = d3.rollup(data, v => d3.sum(v, d => d.value), d => d[dim]);
      const sorted = Array.from(grouped, ([key, value]) => ({ key, value }))
        .sort((a, b) => b.value - a.value);
      const scale = d3.scaleLinear().domain([0, d3.sum(sorted, d => d.value)]).range([0, innerHeight]);

      let offset = 0;
      yStacks[dim] = {};
      sorted.forEach(({ key, value }) => {
        yStacks[dim][key] = { y0: offset, y1: offset + scale(value), total: value };
        offset += scale(value);
      });
    });

    // Calculate chart positioning
    let chartTransform;
    if (!axisY) {
      const xVals = dataDimensions.map(dim => x(dim));
      const minX = Math.min(...xVals);
      const maxX = Math.max(...xVals);
      const offset = (width - (maxX - minX));
      chartTransform = `translate(${offset - x.step() / 2},${adjustedMargin.top})`;
    } else {
      chartTransform = `translate(${adjustedMargin.left-44},${adjustedMargin.top})`;
    }



    const g = svg.append('g').attr('transform', chartTransform);

    // Draw flows
    for (let i = 0; i < dataDimensions.length - 1; i++) {
      const sourceDim = dataDimensions[i];
      const targetDim = dataDimensions[i + 1];

      // Group flows by source-target pair
      const flowGroups = d3.rollup(data,
        v => d3.sum(v, d => d.value),
        d => d[sourceDim],
        d => d[targetDim]
      );

      const sourceOffset = {};
      const targetOffset = {};

      flowGroups.forEach((targets, source) => {
        sourceOffset[source] = sourceOffset[source] || yStacks[sourceDim][source].y0;

        targets.forEach((value, target) => {
          targetOffset[target] = targetOffset[target] || yStacks[targetDim][target].y0;

          const sourceX = x(sourceDim);
          const targetX = x(targetDim);
          const width = x.step() * 0.5;
          const heightScale = d3.scaleLinear()
            .domain([0, yStacks[sourceDim][source].total])
            .range([0, yStacks[sourceDim][source].y1 - yStacks[sourceDim][source].y0]);

          const sourceY0 = sourceOffset[source];
          const sourceY1 = sourceY0 + heightScale(value);
          const targetY0 = targetOffset[target];
          const targetY1 = targetY0 + heightScale(value);

          const path = d3.path();
          path.moveTo(sourceX, sourceY0);
          path.bezierCurveTo(
            sourceX + width / 2, sourceY0,
            targetX - width / 2, targetY0,
            targetX, targetY0
          );
          path.lineTo(targetX, targetY1);
          path.bezierCurveTo(
            targetX - width / 2, targetY1,
            sourceX + width / 2, sourceY1,
            sourceX, sourceY1
          );
          path.closePath();

          g.append('path')
            .attr('d', path.toString())
            .attr('fill', color(source))
            .attr('opacity', 0.7);

          sourceOffset[source] += heightScale(value);
          targetOffset[target] += heightScale(value);
        });
      });
    }

    // Draw axis labels
    if (axisY) {
      dataDimensions.forEach(dim => {
        const axisGroup = g.append('g')
          .attr('transform', `translate(${x(dim)},0)`);

        Object.entries(yStacks[dim]).forEach(([key, { y0, y1 }]) => {
          const mid = (y0 + y1) / 2;
          axisGroup.append('text')
            .attr('x', 10)
            .attr('y', mid)
            .text(key)
            .style('font-size', fontConfig?.size?.small || '11px')
            .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
            .style('font-weight', fontConfig?.weight?.normal || 600)
            .style('alignment-baseline', 'middle')
            .style('fill', 'var(--text-primary)');
        });
      });
    }

    if (axisX) {
      g.selectAll('.x-label')
        .data(dataDimensions)
        .join('text')
        .attr('class', 'x-label')
        .attr('x', d => x(d))
        .attr('y', innerHeight + 16)
        .attr('text-anchor', 'middle')
        .text(d => d)
        .style('font-size', fontConfig?.size?.medium || '11px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.semibold || 600)
        .style('fill', 'var(--text-primary)');
    }

    if (legend) {
      const legendLeft = !axisY ? 0 : adjustedMargin.left;
      const legendG = svg.append('g')
        .attr('transform', `translate(${legendLeft},${height - 25})`);

      const items = color.domain();
      legendG.selectAll('rect')
        .data(items)
        .join('rect')
        .attr('x', (d, i) => i * 100)
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', d => color(d));

      legendG.selectAll('text')
        .data(items)
        .join('text')
        .attr('x', (d, i) => i * 100 + 16)
        .attr('y', 10)
        .text(d => d)
        .style('font-size', fontConfig?.size?.medium || '12px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.medium || 500)
        .style('fill', 'var(--text-secondary)');
    }

  }, [data, dimensions, margin, axisX, axisY, legend, colorScheme, fontConfig]);

  return (
    <svg
      ref={svgRef}
      width={dimensions?.width || 0}
      height={dimensions?.height || 0}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default ParallelSets;
