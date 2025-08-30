import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PieDonut = ({ 
  data, 
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  colorScheme = d3.schemeTableau10,
  innerRadius = 0.6,
  dimensions,
  containerRef,
  fontConfig,
  animation = true
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!dimensions || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;
    const outerRadius = radius - 10;
    const calculatedInnerRadius = outerRadius * innerRadius;

    // Create the main group and center it in the full container
    const g = svg.append('g')
      .attr('transform', `translate(${dimensions.width / 2},${dimensions.height / 2})`);

    // Arc generator
    const arc = d3.arc()
      .innerRadius(calculatedInnerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(3);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(colorScheme);

    // Create pie generator
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    // Create the arcs
    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Add the arc paths
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label))
      .style('transition', animation ? 'opacity 0.2s' : 'none')
      .on('mouseover', function(event, d) {
        if (animation) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8);
        } else {
          d3.select(this).attr('opacity', 0.8);
        }
      })
      .on('mouseout', function(event, d) {
        if (animation) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1);
        } else {
          d3.select(this).attr('opacity', 1);
        }
      });

  }, [data, dimensions, margin, colorScheme, innerRadius, fontConfig, animation]);

  return (
    <svg 
      ref={svgRef} 
      width={dimensions?.width || 0} 
      height={dimensions?.height || 0}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default PieDonut; 