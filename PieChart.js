import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

const ChartContainer = styled.div`
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const ChartTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
`;

const PieChart = ({ 
  data, 
  width = 400, 
  height = 400, 
  title = "Distribution Chart",
  margin = { top: 40, right: 30, bottom: 60, left: 30 }
}) => {
  const ref = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(['#4299e1', '#48bb78', '#ed8936', '#f56565', '#9f7aea', '#38b2ac', '#ed64a6', '#667eea']);

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const labelArc = d3.arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Add pie slices
    g.selectAll('path')
      .data(pie(data))
      .join('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.name))
        .attr('stroke', 'var(--bg-panel)')
        .attr('stroke-width', 2)
        .style('transition', 'opacity 0.2s')
        .on('mouseover', function(event, d) {
          d3.select(this).style('opacity', 0.8);
        })
        .on('mouseout', function(event, d) {
          d3.select(this).style('opacity', 1);
        });

    // Add labels
    g.selectAll('text')
      .data(pie(data))
      .join('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('dy', '0.35em')
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'var(--text-primary)')
        .style('font-weight', '500')
        .text(d => d.data.name);

    // Add percentage labels
    g.selectAll('.percentage')
      .data(pie(data))
      .join('text')
        .attr('class', 'percentage')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '0.35em')
        .style('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', 'var(--text-secondary)')
        .text(d => `${((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1)}%`);

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left},${height - 60})`);

    const legendItems = legend.selectAll('g')
      .data(data)
      .join('g')
        .attr('transform', (d, i) => `translate(${i * 120}, 0)`);

    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => color(d.name))
      .attr('rx', 2);

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .text(d => d.name)
      .style('font-size', '12px')
      .style('fill', 'var(--text-secondary)');

  }, [data, width, height, margin]);

  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <svg ref={ref} width={width} height={height} />
    </ChartContainer>
  );
};

export default PieChart; 