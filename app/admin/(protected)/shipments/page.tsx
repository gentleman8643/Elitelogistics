'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  ArrowUpDown,
  Eye,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createBrowserClient } from '@/lib/supabase/client';
import { getStatusInfo, getStatusBadgeClass, SHIPMENT_STATUSES } from '@/lib/constants';
import type { Shipment, ShipmentStatus } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';

const PAGE_SIZE = 10;

type SortField = 'created_at' | 'tracking_number' | 'recipient_name' | 'status' | 'estimated_delivery';
type SortDir = 'asc' | 'desc';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserClient();
    let query = supabase.from('shipments').select('*', { count: 'exact' });

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(
        `tracking_number.ilike.${term},recipient_name.ilike.${term},sender_name.ilike.${term},reference_number.ilike.${term},current_location.ilike.${term}`
      );
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    query = query.order(sortField, { ascending: sortDir === 'asc' });
    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching shipments:', error);
    }

    setShipments((data || []) as Shipment[]);
    setTotalCount(count || 0);
    setLoading(false);
  }, [search, statusFilter, sortField, sortDir, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchShipments();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, fetchShipments]);

  useEffect(() => {
    fetchShipments();
  }, [page, sortField, sortDir, fetchShipments]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shipments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage all shipments in the system.</p>
        </div>
        <Button asChild>
          <Link href="/admin/shipments/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Shipment
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by tracking #, recipient, sender, reference, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {SHIPMENT_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : shipments.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'No shipments match your filters.'
                  : 'No shipments yet. Create your first shipment to get started.'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button asChild className="mt-4" size="sm">
                  <Link href="/admin/shipments/new">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create Shipment
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button className="flex items-center gap-1" onClick={() => toggleSort('tracking_number')}>
                          Tracking # <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        <button className="flex items-center gap-1" onClick={() => toggleSort('recipient_name')}>
                          Recipient <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">Location</TableHead>
                      <TableHead className="hidden xl:table-cell">Destination</TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1" onClick={() => toggleSort('status')}>
                          Status <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        <button className="flex items-center gap-1" onClick={() => toggleSort('estimated_delivery')}>
                          Est. Delivery <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map((s) => {
                      const info = getStatusInfo(s.status);
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <Link href={`/admin/shipments/${s.id}`} className="font-medium text-primary hover:underline">
                              {s.tracking_number}
                            </Link>
                            <p className="text-xs text-muted-foreground">{s.package_description || 'General Cargo'}</p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm">{s.recipient_name || 'N/A'}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {s.current_location || 'N/A'}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                            {s.destination || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`border ${getStatusBadgeClass(s.status)}`}>
                              {info.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {s.estimated_delivery ? format(new Date(s.estimated_delivery), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(s.updated_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="icon">
                              <Link href={`/admin/shipments/${s.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
