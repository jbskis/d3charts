import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Simple unique ID generator
let uidCounter = 0;
const generateUid = () => `uid-${++uidCounter}`;

const TreeMap = ({ 
  data, 
  margin = { top: 40, right: 30, bottom: 60, left: 60 },
  colorScheme = d3.schemeTableau10,
  dimensions,
  containerRef,
  fontConfig,
  animation = true,
  labels = true,
  legend = true
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

    // Specify the color scale
    const color = d3.scaleOrdinal()
      .domain(transformedData.children ? transformedData.children.map(d => d.name) : [])
      .range(colorScheme);

    // Compute the layout
    const root = d3.treemap()
      .tile(d3.treemapSquarify)
      .size([width, height])
      .padding(2) // Reduced padding significantly
      .round(true)
      (d3.hierarchy(transformedData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));

    // Create the main group and center the treemap content
    const treemapWidth = width;
    const treemapHeight = height;
    const offsetX = (dimensions.width - treemapWidth) / 2;
    const offsetY = (dimensions.height - treemapHeight) / 2;
    const g = svg.append('g')
      .attr('transform', `translate(${offsetX},${offsetY})`);

    // Add a cell for each leaf of the hierarchy
    const leaf = g.selectAll("g")
      .data(root.leaves())
      .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`)
        .style('transition', animation ? 'opacity 0.2s' : 'none')
        .on('mouseover', function(event, d) {
          d3.select(this).style('opacity', 0.8);
        })
        .on('mouseout', function(event, d) {
          d3.select(this).style('opacity', 1);
        });

    // Append a tooltip
    const format = d3.format(",d");
    leaf.append("title")
      .text(d => `${d.ancestors().reverse().map(d => d.data.name).join(".")}\n${format(d.value)}`);

    // Append a color rectangle
    leaf.append("rect")
      .attr("id", d => (d.leafUid = generateUid()))
      .attr("fill", d => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr("fill-opacity", 0.6)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("rx", 2);

    // Append a clipPath to ensure text does not overflow
    leaf.append("clipPath")
      .attr("id", d => (d.clipUid = generateUid()))
      .append("use")
      .attr("xlink:href", d => `#${d.leafUid}`);

    // Append multiline text if labels are enabled
    if (labels) {
      leaf.append("text")
        .attr("clip-path", d => `url(#${d.clipUid})`)
        .selectAll("tspan")
        .data(d => {
          const name = d.data.name;
          const value = format(d.value);
          return [name, value]; // Simple: just name and value
        })
        .join("tspan")
          .attr("x", 4)
          .attr("y", (d, i) => `${1.1 + i * 0.9}em`)
          .attr("fill-opacity", (d, i) => i === 1 ? 0.7 : 1) // Value is second element
          .style('font-size', function(d, i) {
            // Dynamic font sizing based on rectangle size with rem units
            const leafData = d3.select(this.parentNode.parentNode).datum();
            const rectWidth = leafData.x1 - leafData.x0;
            const rectHeight = leafData.y1 - leafData.y0;
            
            // Calculate font size based on rectangle dimensions
            const minDimension = Math.min(rectWidth, rectHeight);
            if (minDimension < 30) return '0.5rem';
            if (minDimension < 50) return '0.6rem';
            if (minDimension < 80) return '0.7rem';
            if (minDimension < 120) return '0.8rem';
            return '0.8rem'; // Cap at 0.8rem
          })
          .style('font-family', fontConfig?.family || 'Space Grotesk, sans-serif')
          .style('font-weight', fontConfig?.weight?.medium || 500)
          .style('fill', 'white')
          .text(function(d, i) {
            // Smart ellipsis system for small rectangles
            const leafData = d3.select(this.parentNode.parentNode).datum();
            const rectWidth = leafData.x1 - leafData.x0;
            const rectHeight = leafData.y1 - leafData.y0;
            
            if (i === 0) { // Name
              if (rectWidth < 40) {
                // For very small rectangles, just first letter
                return d.charAt(0).toUpperCase();
              } else if (rectWidth < 80) {
                // For small rectangles, show start + "..." + end
                const maxLength = Math.floor(rectWidth / 6); // Approximate chars that fit
                if (d.length <= maxLength) return d;
                
                const startLength = Math.floor(maxLength / 2) - 1;
                const endLength = Math.floor(maxLength / 2) - 1;
                const start = d.substring(0, startLength);
                const end = d.substring(d.length - endLength);
                return `${start}...${end}`;
              } else if (rectWidth < 120) {
                // For medium rectangles, truncate with ellipsis
                const maxLength = Math.floor(rectWidth / 6);
                return d.length > maxLength ? d.substring(0, maxLength - 3) + '...' : d;
              }
              return d;
            } else { // Value
              if (rectWidth < 60) {
                // For very small rectangles, show abbreviated value
                const num = parseInt(d.replace(/,/g, ''));
                if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
                if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
                return num.toString();
              }
              return d;
            }
          })
          .style('display', function(d, i) {
            // Show text on all rectangles, let font sizing handle readability
            const leafData = d3.select(this.parentNode.parentNode).datum();
            const rectWidth = leafData.x1 - leafData.x0;
            const rectHeight = leafData.y1 - leafData.y0;
            return (rectWidth > 20 && rectHeight > 15) ? 'block' : 'none';
          });
    }

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

  }, [data, dimensions, margin, colorScheme, fontConfig, animation, labels, legend]);

  return (
    <svg 
      ref={svgRef} 
      width={dimensions?.width || 0} 
      height={dimensions?.height || 0}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default TreeMap; 