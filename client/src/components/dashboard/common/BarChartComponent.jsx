// src/components/dashboard/common/BarChartComponent.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const BarChartComponent = ({
  data,
  dataKey,
  title,
  color = '#3b82f6',
  height = 250,
  barSize = 40,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  customColors = null,
  xAxisDataKey = 'name',
  yAxisLabel = null,
  formatYAxis = null,
  formatTooltip = null,
  stacked = false,
  multipleBars = false,
  barDataKeys = []
}) => {
  // Default color palette for multiple bars
  const defaultColors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
  ];

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-center">No data available for chart</p>
        <p className="text-sm text-gray-400 mt-1">Add data to see visualization</p>
      </div>
    );
  }

  // Calculate max value for better Y-axis scaling
  const calculateMaxValue = () => {
    if (!multipleBars) {
      return Math.max(...data.map(item => item[dataKey] || 0)) * 1.1;
    }
    
    let max = 0;
    barDataKeys.forEach(key => {
      const keyMax = Math.max(...data.map(item => item[key] || 0));
      if (keyMax > max) max = keyMax;
    });
    return max * 1.1;
  };

  // Custom tooltip formatter
  const renderCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.dataKey}:</span>
              <span className="font-semibold">
                {formatTooltip ? formatTooltip(entry.value) : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom legend formatter
  const renderColorfulLegendText = (value, entry) => {
    const { color } = entry;
    return (
      <span style={{ color, fontWeight: 500 }}>
        {value}
      </span>
    );
  };

  return (
    <div className="h-full w-full">
      {/* Chart title */}
      {title && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
        </div>
      )}

      {/* Responsive chart container */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: yAxisLabel ? 40 : 20,
            bottom: 5,
          }}
          barCategoryGap={multipleBars ? 15 : 20}
        >
          {/* Grid lines */}
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
          )}

          {/* X Axis */}
          <XAxis
            dataKey={xAxisDataKey}
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tick={{ fill: '#6b7280' }}
          />

          {/* Y Axis */}
          <YAxis
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tick={{ fill: '#6b7280' }}
            width={yAxisLabel ? 50 : 40}
            label={yAxisLabel ? {
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              offset: -10,
              style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' }
            } : null}
            tickFormatter={formatYAxis}
            domain={[0, calculateMaxValue()]}
          />

          {/* Tooltip */}
          {showTooltip && (
            <Tooltip
              content={renderCustomTooltip}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
          )}

          {/* Legend */}
          {showLegend && multipleBars && (
            <Legend
              verticalAlign="top"
              height={36}
              formatter={renderColorfulLegendText}
            />
          )}

          {/* Single Bar */}
          {!multipleBars && (
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[4, 4, 0, 0]}
              barSize={barSize}
            >
              {customColors && data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={customColors[index % customColors.length]}
                />
              ))}
            </Bar>
          )}

          {/* Multiple Bars */}
          {multipleBars && barDataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={customColors ? customColors[index] : defaultColors[index % defaultColors.length]}
              radius={index === barDataKeys.length - 1 ? [4, 4, 0, 0] : [4, 4, 0, 0]}
              barSize={barSize}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Chart summary stats */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <div>
            <span className="font-medium">Items:</span> {data.length}
          </div>
          <div>
            <span className="font-medium">Max:</span>{' '}
            {!multipleBars
              ? Math.max(...data.map(item => item[dataKey] || 0)).toLocaleString()
              : barDataKeys.map(key => 
                  `${key}: ${Math.max(...data.map(item => item[key] || 0)).toLocaleString()}`
                ).join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate gradient color
BarChartComponent.generateGradientColor = (baseColor, opacity = 1) => {
  return `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(
    baseColor.slice(3, 5),
    16
  )}, ${parseInt(baseColor.slice(5, 7), 16)}, ${opacity})`;
};

// Helper function to prepare data for grouped bar chart
BarChartComponent.prepareGroupedData = (data, groupBy, valueKey) => {
  const grouped = data.reduce((acc, item) => {
    const group = item[groupBy];
    if (!acc[group]) {
      acc[group] = { name: group, value: 0 };
    }
    acc[group].value += item[valueKey];
    return acc;
  }, {});

  return Object.values(grouped);
};

// Helper function to prepare data for stacked bar chart
BarChartComponent.prepareStackedData = (data, categories, valueKey) => {
  return data.map(item => {
    const result = { name: item.name || item.label };
    categories.forEach(category => {
      result[category] = item[category] || 0;
    });
    return result;
  });
};

export default BarChartComponent;