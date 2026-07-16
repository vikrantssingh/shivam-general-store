"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { getRevenueHistory } from "@/backend/actions/admin-dashboard";

export default function RevenueHistorySection() {
  const [period, setPeriod] = useState("1w");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchHistory() {
      setLoading(true);
      try {
        const result = await getRevenueHistory(period);
        if (result && !result.error && isMounted) {
          setData(result.historyData);
          
          const total = result.historyData.reduce((sum, item) => sum + item.revenue, 0);
          setTotalRevenue(total);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchHistory();
    return () => { isMounted = false };
  }, [period]);

  const periods = [
    { id: "1w", label: "1 Week" },
    { id: "2w", label: "2 Weeks" },
    { id: "1m", label: "1 Month" },
    { id: "3m", label: "3 Months" },
  ];

  return (
    <Card className="shadow-sm border-t-4 border-t-indigo-500 mt-8">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 pb-4 gap-4">
        <div>
          <CardTitle className="text-lg font-bold text-gray-800">Revenue History</CardTitle>
          <CardDescription>Day-by-day revenue breakdown</CardDescription>
        </div>
        
        {/* Filters */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                period === p.id 
                  ? "bg-white text-indigo-700 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="mb-6 flex justify-between items-end border-b pb-4">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue ({periods.find(p => p.id === period)?.label})</p>
            <div className="text-3xl font-extrabold text-indigo-700 mt-1">
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Chart */}
            <div className="lg:col-span-2 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: '#888' }} 
                    minTickGap={30}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: '#888' }} 
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    labelStyle={{ color: '#4b5563', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Right Side: Table */}
            <div className="lg:col-span-1 border rounded-lg overflow-hidden h-[400px] flex flex-col bg-white shadow-sm">
              <div className="overflow-x-auto flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 shadow-sm z-10">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                          No revenue data found.
                        </td>
                      </tr>
                    ) : (
                      [...data].reverse().map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{row.date}</div>
                            <div className="text-xs text-gray-500">{row.day}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">
                            {row.revenue > 0 ? (
                              <span className="text-green-700">₹{row.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            ) : (
                              <span className="text-gray-400">₹0.00</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
