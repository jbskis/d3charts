import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Icicle = ({ 
  data, 
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  axisX = true,
  axisY = true,
  legend = true,
  labels = true,
  colorScheme = d3.schemeTableau10,
  dimensions,
  containerRef,
  fontConfig
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

    // Transform data if needed (handle different data formats)
    let transformedData = data;
    
    // If data is flat array, create hierarchy
    if (Array.isArray(data) && !data.children) {
      transformedData = {
        name: "Root",
        children: data.map(d => ({
          name: d.name || d.label || `Item ${d.value}`,
          value: d.value || d.size || 1
        }))
      };
    }

    // Create the color scale
    const color = d3.scaleOrdinal()
      .domain(transformedData.children ? transformedData.children.map(d => d.name) : [])
      .range(colorScheme);

    // Calculate available area with margin
    const availableWidth = dimensions.width - (margin.left || 0) - (margin.right || 0);
    const availableHeight = dimensions.height - (margin.top || 0) - (margin.bottom || 0);

    // Compute the layout
    const hierarchy = d3.hierarchy(transformedData)
      .sum(d => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);
    
    const root = d3.partition()
      .size([availableHeight, availableWidth])
      (hierarchy);

    // Find min/max y0/y1 for centering and scaling
    const y0s = root.descendants().map(d => d.y0);
    const y1s = root.descendants().map(d => d.y1);
    const minY0 = Math.min(...y0s);
    const maxY1 = Math.max(...y1s);
    const icicleWidth = maxY1 - minY0;
    const icicleHeight = root.x1 - root.x0;
    const scale = Math.min(availableWidth / icicleWidth, availableHeight / icicleHeight, 1);
    const offsetX = ((dimensions.width - icicleWidth * scale) / 2) - minY0 * scale;
    const offsetY = ((dimensions.height - icicleHeight * scale) / 2);
    const g = svg.append('g')
      .attr('transform', `translate(${offsetX},${offsetY}) scale(${scale})`);

    // Append cells
    const cell = g
      .selectAll("g")
      .data(root.descendants())
      .join("g")
        .attr("transform", d => `translate(${d.y0},${d.x0})`)
        .style('transition', 'opacity 0.2s')
        .on('mouseover', function(event, d) {
          d3.select(this).style('opacity', 0.8);
        })
        .on('mouseout', function(event, d) {
          d3.select(this).style('opacity', 1);
        });

    // Helper functions
    const rectHeight = (d) => {
      return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
    };

    const labelVisible = (d) => {
      return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
    };

    // Append rectangles
    const rect = cell.append("rect")
      .attr("width", d => d.y1 - d.y0 - 1)
      .attr("height", d => rectHeight(d))
      .attr("fill-opacity", 0.6)
      .attr("fill", d => {
        if (!d.depth) return "#ccc";
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .style("cursor", "pointer")
      .attr("rx", 2);

    // Append text if labels are enabled
    if (labels) {
      const text = cell.append("text")
        .style("user-select", "none")
        .attr("pointer-events", "none")
        .attr("x", 4)
        .attr("y", 13)
        .attr("fill-opacity", d => +labelVisible(d))
        .style('font-size', fontConfig?.size?.small || '10px')
        .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
        .style('font-weight', fontConfig?.weight?.medium || 500)
        .style('fill', 'white');

      text.append("tspan")
        .text(d => d.data.name);

      const format = d3.format(",d");
      text.append("tspan")
        .attr("fill-opacity", d => labelVisible(d) * 0.7)
        .text(d => ` ${format(d.value)}`);
    }

    // Append tooltips
    const format = d3.format(",d");
    cell.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    // Add legend if enabled
    if (legend && transformedData.children) {
      const legend = svg.append('g')
        .attr('transform', `translate(${margin.left},${dimensions.height - 20})`);

      legend.selectAll('rect')
        .data(transformedData.children)
        .join('rect')
          .attr('x', (d, i) => i * 120)
          .attr('y', 0)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', d => color(d.name))
          .attr('rx', 2);

      legend.selectAll('text')
        .data(transformedData.children)
        .join('text')
          .attr('x', (d, i) => i * 120 + 20)
          .attr('y', 10)
          .text(d => d.name)
          .style('font-size', fontConfig?.size?.medium || '12px')
          .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
          .style('font-weight', fontConfig?.weight?.medium || 500)
          .style('fill', 'var(--text-secondary)');
    }

  }, [data, dimensions, margin, axisX, axisY, legend, labels, colorScheme, fontConfig]);

  return (
    <svg 
      ref={svgRef} 
      width={dimensions?.width || 0} 
      height={dimensions?.height || 0}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default Icicle; 