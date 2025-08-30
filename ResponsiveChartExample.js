import React from 'react';
import styled from 'styled-components';
import D3Chart from './D3Chart';
import { revenueData } from '../../utils/chartData';

const ExampleContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
  height: 100vh;
`;

const ChartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ResponsiveChartExample = () => {
  return (
    <ExampleContainer>
      <ChartSection>
        <h2>Responsive Charts</h2>
        
        {/* Percentage-based sizing */}
        <D3Chart 
          type="grouped-bar"
          data={revenueData}
          title="Revenue by Category (100% width)"
          width="100%"
          height="300px"
          size="medium"
        />
        
        {/* Viewport-based sizing */}
        <D3Chart 
          type="grouped-bar"
          data={revenueData}
          title="Revenue by Category (50vw width)"
          width="50vw"
          height="200px"
          size="small"
        />
      </ChartSection>
      
      <ChartSection>
        <h2>Fixed Size Charts</h2>
        
        {/* Fixed pixel sizing */}
        <D3Chart 
          type="grouped-bar"
          data={revenueData}
          title="Revenue by Category (Fixed 400px)"
          width="400px"
          height="300px"
          axisX={false}
          legend={true}
        />
        
        {/* Size preset */}
        <D3Chart 
          type="grouped-bar"
          data={revenueData}
          title="Revenue by Category (Large preset)"
          size="large"
          axisY={false}
        />
      </ChartSection>
    </ExampleContainer>
  );
};

export default ResponsiveChartExample; 