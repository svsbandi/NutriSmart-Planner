
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NutrientData } from '../types';

interface PieChartComponentProps {
  data: NutrientData[];
  title?: string;
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No data available for chart.</p>;
  }
  
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 my-4">
      {title && <h3 className="text-lg font-semibold text-center text-primary mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
