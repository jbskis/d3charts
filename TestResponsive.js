import React, { useState } from 'react';
import styled from 'styled-components';
import D3Chart from './D3Chart';
import { revenueData } from '../../utils/chartData';

const TestContainer = styled.div`
  padding: 2rem;
`;

const SizeControls = styled.div`
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ChartWrapper = styled.div`
  border: 2px dashed #ccc;
  margin: 1rem 0;
  transition: all 0.3s ease;
  
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

const TestResponsive = () => {
  const [size, setSize] = useState('medium');

  return (
    <TestContainer>
      <h1>Responsive Chart Test</h1>
      
      <SizeControls>
        <label>
          Container Size:
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="small">Small (300x200)</option>
            <option value="medium">Medium (600x400)</option>
            <option value="large">Large (100% width)</option>
          </select>
        </label>
      </SizeControls>

      <ChartWrapper className={size}>
        <D3Chart 
          type="grouped-bar"
          data={revenueData}
          title={`Responsive Chart - ${size} container`}
          width="100%"
          height="100%"
        />
      </ChartWrapper>

      <p>Try resizing your browser window to see the chart respond!</p>
    </TestContainer>
  );
};

export default TestResponsive; 