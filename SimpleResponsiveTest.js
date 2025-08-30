import React, { useState } from 'react';
import styled from 'styled-components';
import D3Chart from './D3Chart';
import { revenueData, salesData, pieDonutData, categoryData, progressCircleData, histogramData, treeMapData, icicleData, hexChartData } from '../../utils/chartData';
import { claimsFlowData } from '../../utils/claimsData';

const TestContainer = styled.div`
  padding: 2rem;
`;

const Controls = styled.div`
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ChartWrapper = styled.div`
  border: 2px dashed #ccc;
  margin: 1rem 0;
  transition: all 0.3s ease;
  background: #f9f9f9;
  
  &.small {
    width: 300px;
    height: 200px;
  }
  
  &.medium {
    width: 600px;
    height: 400px;
  }
  
  &.large {
    width: 100%;
    height: 500px;
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
`;

const SimpleResponsiveTest = () => {
  const [size, setSize] = useState('medium');
  const [chartType, setChartType] = useState('grouped-bar');
  const [showLabels, setShowLabels] = useState(true);

  const getChartData = (type) => {
    switch (type) {
      case 'grouped-bar':
        return revenueData;
      case 'line':
        return salesData;
      case 'pie-donut':
        return pieDonutData;
      case 'parallel-sets':
        return claimsFlowData;
      case 'progress-circle':
        return progressCircleData;
      case 'histogram':
        return histogramData;
      case 'tree-map':
        return treeMapData;
      case 'icicle':
        return icicleData;
      case 'hex-chart':
        return hexChartData;
      default:
        return revenueData;
    }
  };

  const getChartTitle = (type) => {
    switch (type) {
      case 'grouped-bar':
        return 'Revenue by Category';
      case 'line':
        return 'Sales Trends';
      case 'pie-donut':
        return 'Device Usage';
      case 'parallel-sets':
        return 'Claims Flow Analysis';
      case 'progress-circle':
        return 'KPI Progress';
      case 'histogram':
        return 'Data Distribution';
      case 'tree-map':
        return 'Resource Usage';
      case 'icicle':
        return 'Resource Usage';
      case 'hex-chart':
        return 'Hex Chart';
      default:
        return 'Chart';
    }
  };

  return (
    <TestContainer>
      <h1>Simple Responsive Chart Test</h1>
      
      <Controls>
        <label>
          Container Size:
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="small">Small (300x200)</option>
            <option value="medium">Medium (600x400)</option>
            <option value="large">Large (100% width)</option>
          </select>
        </label>
        
        <label>
          Chart Type:
          <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <option value="grouped-bar">Grouped Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie-donut">Pie Donut Chart</option>
            <option value="parallel-sets">Parallel Sets Chart</option>
            <option value="progress-circle">Progress Circle</option>
            <option value="histogram">Histogram</option>
            <option value="tree-map">Tree Map</option>
            <option value="icicle">Icicle Chart</option>
            <option value="hex-chart">Hex Chart</option>
          </select>
        </label>

        {chartType === 'pie-donut' && (
          <label>
            <input 
              type="checkbox" 
              checked={showLabels} 
              onChange={(e) => setShowLabels(e.target.checked)}
            />
            Show Labels
          </label>
        )}
      </Controls>

      <ChartGrid>
        <ChartWrapper className={size}>
          <D3Chart 
            type={chartType}
            data={getChartData(chartType)}
            title={`${getChartTitle(chartType)} in ${size} container`}
            labels={chartType === 'pie-donut' ? showLabels : true}
          />
        </ChartWrapper>
        
        <ChartWrapper className={size}>
          <D3Chart 
            type="parallel-sets"
            data={claimsFlowData}
            title={`Claims Flow in ${size} container`}
            legend={true}
            axisX={true}
            axisY={true}
          />
        </ChartWrapper>
      </ChartGrid>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>Font Test - All charts now use Space Grotesk</h3>
        <p>Check that all text elements (axes, legends, labels) use the Space Grotesk font family.</p>
        <ul>
          <li>✅ Grouped Bar Chart - Axes and legend text</li>
          <li>✅ Line Chart - Axes and legend text</li>
          <li>✅ Pie Donut Chart - Labels and legend text</li>
          <li>✅ Parallel Sets Chart - Axis labels and legend text</li>
        </ul>
      </div>

      <p>Try resizing your browser window to see the charts respond!</p>
    </TestContainer>
  );
};

export default SimpleResponsiveTest; 