'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  Truck,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createBrowserClient } from '@/lib/supabase/client';
import { getStatusInfo, getStatusBadgeClass, getServiceInfo } from '@/lib/constants';
import type { Shipment } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';

interface Stats {
  total: number;
  created: number;
  processing: number;
  in_transit: number;
  delayed: number;
  out_for_delivery: number;
  delivered: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createBrowserClient();

      const { data: shipments } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      const all = (shipments || []) as Shipment[];
      setRecentShipments(all.slice(0, 10));

      setStats({
        total: all.length,
        created: all.filter((s) => s.status === 'created' || s.status === 'picked_up').length,
        processing: all.filter((s) => s.status === 'processing' || s.status === 'departed').length,
        in_transit: all.filter((s) => s.status === 'in_transit' || s.status === 'arrived' || s.status === 'customs').length,
        delayed: all.filter((s) => s.status === 'delayed').length,
        out_for_delivery: all.filter((s) => s.status === 'out_for_delivery').length,
        delivered: all.filter((s) => s.status === 'delivered').length,
      });

      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Shipments', value: stats?.total ?? 0, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pending', value: stats?.created ?? 0, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: 'Processing', value: stats?.processing ?? 0, icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { label: 'In Transit', value: stats?.in_transit ?? 0, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Delayed', value: stats?.delayed ?? 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Out for Delivery', value: stats?.out_for_delivery ?? 0, icon: Truck, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Delivered', value: stats?.delivered ?? 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  // Simple bar chart data
  const chartData = [
    { label: 'Pending', value: stats?.created ?? 0, color: 'bg-slate-400' },
    { label: 'Processing', value: stats?.processing ?? 0, color: 'bg-cyan-500' },
    { label: 'In Transit', value: stats?.in_transit ?? 0, color: 'bg-indigo-500' },
    { label: 'Delayed', value: stats?.delayed ?? 0, color: 'bg-red-500' },
    { label: 'Out for Delivery', value: stats?.out_for_delivery ?? 0, color: 'bg-orange-500' },
    { label: 'Delivered', value: stats?.delivered ?? 0, color: 'bg-green-500' },
  ];
  const maxChart = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of your logistics operations.</p>
        </div>
        <Button asChild>
          <Link href="/admin/shipments/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Shipment
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {statCards.map((card) => (
          <Card key={card.label} className="border-border/60">
            <CardContent className="p-4">
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-4.5 w-4.5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <Card className="border-border/60 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${(item.value / maxChart) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Shipments */}
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Shipments</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/shipments">
                View All
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentShipments.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">No shipments yet.</p>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/admin/shipments/new">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create First Shipment
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking #</TableHead>
                      <TableHead className="hidden sm:table-cell">Recipient</TableHead>
                      <TableHead className="hidden md:table-cell">Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentShipments.map((s) => {
                      const info = getStatusInfo(s.status);
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <Link href={`/admin/shipments/${s.id}`} className="font-medium text-primary hover:underline">
                              {s.tracking_number}
                            </Link>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm">{s.recipient_name || 'N/A'}</span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {s.current_location || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`border ${getStatusBadgeClass(s.status)}`}>
                              {info.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(s.updated_at), { addSuffix: true })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
