import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Truck, Calendar } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDubai } from '@/lib/formatDubaiTime';
import { subDays, format, startOfDay, isWithinInterval, parseISO } from 'date-fns';

const PRESETS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'Custom', days: null },
];

const COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#f97316'];

function StatCard({ title, value, sub, icon: Icon, color }) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10 ${color}`} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} bg-opacity-15`}>
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg px-4 py-2 text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.name === 'Revenue' ? `AED ${Number(p.value).toFixed(2)}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const [preset, setPreset] = useState(30);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const isCustom = preset === null;

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 500),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  // --- Date range ---
  const { rangeStart, rangeEnd, numDays } = useMemo(() => {
    const end = startOfDay(new Date());
    if (isCustom && customFrom && customTo) {
      const start = startOfDay(new Date(customFrom));
      const to = startOfDay(new Date(customTo));
      const diff = Math.round((to - start) / 86400000) + 1;
      return { rangeStart: start, rangeEnd: to, numDays: diff };
    }
    const days = preset || 30;
    return { rangeStart: subDays(end, days - 1), rangeEnd: end, numDays: days };
  }, [preset, customFrom, customTo, isCustom]);

  // --- Filter orders in range ---
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (!o.created_date) return false;
      const d = startOfDay(new Date(o.created_date));
      return d >= rangeStart && d <= rangeEnd;
    });
  }, [orders, rangeStart, rangeEnd]);

  // --- KPI metrics (range-scoped) ---
  const today = startOfDay(new Date());
  const todayOrders = orders.filter(o => {
    if (!o.created_date) return false;
    return startOfDay(new Date(o.created_date)).getTime() === today.getTime();
  });
  const todayRevenue = todayOrders.filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + (o.total_amount || 0), 0);
  const rangeRevenue = filteredOrders.filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + (o.total_amount || 0), 0);
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
  const activeDeliveries = orders.filter(o => o.status === 'on_the_way').length;
  const clientCount = users.filter(u => ['client', 'special_client'].includes(u.role)).length;

  // --- Daily revenue + order volume over range ---
  const dailyData = useMemo(() => {
    const days = Array.from({ length: numDays }, (_, i) => {
      const d = subDays(rangeEnd, numDays - 1 - i);
      return { date: format(d, numDays > 31 ? 'MMM d' : 'MMM d'), key: format(d, 'yyyy-MM-dd'), revenue: 0, orders: 0 };
    });
    filteredOrders.forEach(o => {
      if (o.status === 'cancelled') return;
      const key = format(new Date(o.created_date), 'yyyy-MM-dd');
      const day = days.find(d => d.key === key);
      if (day) {
        day.revenue += o.total_amount || 0;
        day.orders += 1;
      }
    });
    // For long ranges, group by week
    if (numDays > 31) {
      const weekly = {};
      days.forEach(d => {
        const wk = d.key.substring(0, 7); // yyyy-MM
        if (!weekly[wk]) weekly[wk] = { date: format(new Date(d.key), 'MMM yy'), key: wk, revenue: 0, orders: 0 };
        weekly[wk].revenue += d.revenue;
        weekly[wk].orders += d.orders;
      });
      return Object.values(weekly);
    }
    return days;
  }, [filteredOrders, numDays, rangeEnd]);

  // --- Order status breakdown (range) ---
  const statusData = useMemo(() => {
    const counts = {};
    filteredOrders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ name: status.replace(/_/g, ' '), value: count }));
  }, [filteredOrders]);

  // --- Top products by revenue (range) ---
  const topProducts = useMemo(() => {
    const map = {};
    filteredOrders.forEach(o => {
      if (o.status === 'cancelled') return;
      (o.items || []).forEach(item => {
        if (!map[item.product_name]) map[item.product_name] = { name: item.product_name, revenue: 0, qty: 0 };
        map[item.product_name].revenue += item.total || 0;
        map[item.product_name].qty += item.quantity || 0;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 7);
  }, [filteredOrders]);

  // --- Recent orders (range) ---
  const recentOrders = filteredOrders.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Key metrics and performance insights</p>
        </div>

        {/* Period filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-1 gap-0.5">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => setPreset(p.days)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  preset === p.days
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {isCustom && (
            <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2 py-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <Input type="date" className="h-7 text-xs w-30 border-0 bg-transparent p-0 focus-visible:ring-0 shadow-none" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
              <span className="text-muted-foreground text-xs">–</span>
              <Input type="date" className="h-7 text-xs w-30 border-0 bg-transparent p-0 focus-visible:ring-0 shadow-none" value={customTo} onChange={e => setCustomTo(e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Revenue" value={`AED ${todayRevenue.toFixed(2)}`} sub={`${todayOrders.length} orders today`} icon={DollarSign} color="bg-primary" />
        <StatCard title="Period Revenue" value={`AED ${rangeRevenue.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`} sub={`${filteredOrders.length} orders in period`} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="Pending Orders" value={pendingOrders} sub="In this period" icon={ShoppingCart} color="bg-amber-500" />
        <StatCard title="Active Deliveries" value={activeDeliveries} sub={`${clientCount} total clients`} icon={Truck} color="bg-indigo-500" />
      </div>

      {/* Revenue & Volume Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue</CardTitle>
            <CardDescription>Daily revenue from non-cancelled orders in selected period</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Volume</CardTitle>
            <CardDescription>Number of orders placed in selected period</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="Orders" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products + Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Products by Revenue</CardTitle>
            <CardDescription>Best performing products (non-cancelled)</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[0, 4, 4, 0]}>
                    {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
            <CardDescription>Current distribution of all orders</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {statusData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs capitalize">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Client</th>
                    <th className="pb-2 font-medium hidden sm:table-cell">Date</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 font-medium">{order.client_name}</td>
                      <td className="py-2.5 text-muted-foreground hidden sm:table-cell">{order.created_date ? formatDubai(order.created_date, 'date') : '-'}</td>
                      <td className="py-2.5 font-semibold">AED {order.total_amount?.toFixed(2)}</td>
                      <td className="py-2.5"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}