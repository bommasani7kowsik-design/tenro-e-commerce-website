import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetUserOrders, useGetCallerUserProfile, useIsAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Package, User, Shield, CheckCircle2, Crown, Info, Loader2 } from 'lucide-react';
import type { Order } from '../backend';

function OrderStatusBadge({ status }: { status: Order['orderStatus'] }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    processing: 'default',
    shipped: 'secondary',
    delivered: 'outline',
    cancelled: 'destructive',
  };

  return <Badge variant={variants[status]}>{status}</Badge>;
}

export default function AccountPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: orders = [], isLoading } = useGetUserOrders();
  const { data: profile } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  if (!identity) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-md text-center">
          <User className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">Login Required</h2>
          <p className="mb-6 text-muted-foreground">Please login to view your account</p>
          <Button onClick={() => navigate({ to: '/' })}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">My Account</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{profile?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{profile?.email || 'N/A'}</p>
              </div>
              {profile?.mobileNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-semibold">{profile.mobileNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAdminLoading ? (
                <div className="flex items-center gap-3 rounded-lg border border-muted bg-muted/50 p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-semibold">Verifying admin status...</p>
                    <p className="text-sm text-muted-foreground">
                      Please wait while we confirm your admin rights
                    </p>
                  </div>
                </div>
              ) : isAdmin ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-100">Administrator</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Full access to admin features
                      </p>
                    </div>
                    <Crown className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate({ to: '/admin' })}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Go to Admin Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
                    <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 dark:text-blue-100">Standard Account</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Admin access is restricted to authorized personnel only. If you need admin privileges, please contact support.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Button className="mt-4" onClick={() => navigate({ to: '/products' })}>
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(Number(order.timestamp) / 1000000).toLocaleDateString()}
                          </p>
                        </div>
                        <OrderStatusBadge status={order.orderStatus} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="font-semibold">${(Number(order.total) / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
