// src/components/dashboard/common/LineChartComponent.jsx - UPDATED
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const LineChartComponent = ({ 
  data, 
  dataKey, 
  title, 
  color = '#3b82f6',
  height = 250,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  showMultipleLines = false,
  lineDataKeys = [],
  lineColors = [],
  formatTooltip = null
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
        <div className="text-4xl mb-2">📈</div>
        <p className="text-center">No data available for chart</p>
        <p className="text-sm text-gray-400 mt-1">Add data to see trends</p>
      </div>
    );
  }

  // Default colors for multiple lines
  const defaultColors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
  ];

  // Custom tooltip
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
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
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
            dataKey="name"
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
            tickFormatter={(value) => value.toLocaleString()}
          />

          {/* Tooltip */}
          {showTooltip && (
            <Tooltip
              content={renderCustomTooltip}
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
            />
          )}

          {/* Legend */}
          {showLegend && showMultipleLines && (
            <Legend
              verticalAlign="top"
              height={36}
            />
          )}

          {/* Single Line */}
          {!showMultipleLines && (
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: color }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: color }}
            />
          )}

          {/* Multiple Lines */}
          {showMultipleLines && lineDataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={lineColors[index] || defaultColors[index % defaultColors.length]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Chart summary */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <div>
            <span className="font-medium">Periods:</span> {data.length}
          </div>
          <div>
            <span className="font-medium">Trend:</span>{' '}
            {data.length > 1 && (
              <span className={
                data[data.length - 1][showMultipleLines ? lineDataKeys[0] || dataKey : dataKey] > 
                data[0][showMultipleLines ? lineDataKeys[0] || dataKey : dataKey] 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }>
                {data[data.length - 1][showMultipleLines ? lineDataKeys[0] || dataKey : dataKey] > 
                 data[0][showMultipleLines ? lineDataKeys[0] || dataKey : dataKey] 
                  ? '↗ Growing' 
                  : '↘ Declining'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineChartComponent;