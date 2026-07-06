"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444"];

interface ChartProps {
  dataKey?: string;
  duration?: number;
  data?: Array<{ [key: string]: string | number }>;
}

export function RevenueChart({ dataKey = "revenue" }: ChartProps) {
  // Generate sample data
  const data = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      [dataKey]: Math.floor(Math.random() * 500000 + 100000)
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          }}
          formatter={(value: number) => [`₦${value.toLocaleString()}`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="#6366F1"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRevenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SalesChart() {
  const data = [
    { name: "Mon", sales: 4000 },
    { name: "Tue", sales: 3000 },
    { name: "Wed", sales: 5000 },
    { name: "Thu", sales: 2780 },
    { name: "Fri", sales: 6890 },
    { name: "Sat", sales: 8390 },
    { name: "Sun", sales: 6490 }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <Bar dataKey="sales" fill="#6366F1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function WorkersChart() {
  const data = [
    { name: "John D.", sales: 450000 },
    { name: "Sarah M.", sales: 380000 },
    { name: "Mike R.", sales: 290000 },
    { name: "Lisa K.", sales: 220000 },
    { name: "Tom B.", sales: 180000 }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical">
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 10 }}
          width={50}
          tickLine={false}
        />
        <Bar dataKey="sales" fill="#6366F1" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function InventoryChart() {
  const data = [
    { name: "In Stock", value: 65, color: "#10B981" },
    { name: "Low Stock", value: 25, color: "#F59E0B" },
    { name: "Out of Stock", value: 10, color: "#EF4444" }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={50}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CommissionChart() {
  const data = [
    { name: "Pending", value: 150000 },
    { name: "Approved", value: 280000 },
    { name: "Paid", value: 420000 }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={50}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ProfitChart() {
  const data = [
    { month: "Jan", revenue: 4000, profit: 2400 },
    { month: "Feb", revenue: 3000, profit: 1398 },
    { month: "Mar", revenue: 5000, profit: 3800 },
    { month: "Apr", revenue: 4780, profit: 3908 },
    { month: "May", revenue: 5890, profit: 4800 },
    { month: "Jun", revenue: 4390, profit: 3800 }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} />
        <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}