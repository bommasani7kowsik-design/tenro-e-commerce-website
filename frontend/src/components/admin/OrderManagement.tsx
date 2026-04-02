import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllOrders, useUpdateOrderStatus } from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '../../backend';

function OrderStatusBadge({ status }: { status: Order['orderStatus'] }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    processing: 'default',
    shipped: 'secondary',
    delivered: 'outline',
    cancelled: 'destructive',
  };

  return <Badge variant={variants[status]}>{status}</Badge>;
}

export default function OrderManagement() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: status as OrderStatus });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border p-4">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Number(order.timestamp) / 1000000).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Customer: {order.user?.toString().slice(0, 10) || 'Guest'}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.orderStatus} />
                    <Select
                      value={order.orderStatus}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                      disabled={updateStatus.isPending}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Items:</p>
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      • Product ID: {item.productId} • Size: {item.size} • Qty: {item.quantity.toString()}
                    </p>
                  ))}
                  <p className="mt-2 font-semibold">Total: ${(Number(order.total) / 100).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
