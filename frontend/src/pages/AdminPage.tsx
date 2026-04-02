import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ProductManagement from '../components/admin/ProductManagement';
import OrderManagement from '../components/admin/OrderManagement';
import { Shield, AlertCircle, LogIn, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading, refetch } = useIsAdmin();

  // Refetch admin status when component mounts to ensure fresh data
  useEffect(() => {
    if (identity) {
      refetch();
    }
  }, [identity, refetch]);

  if (isLoading) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md border-2 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-6 h-16 w-16 animate-spin text-primary" />
            <p className="text-lg font-semibold text-foreground">Verifying admin access...</p>
            <p className="mt-2 text-sm text-muted-foreground">Please wait while we confirm your credentials</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md border-2 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/20">
              <Shield className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">
                You don't have permission to access the admin dashboard.
              </AlertDescription>
            </Alert>

            <div className="rounded-lg border-2 border-muted bg-muted/30 p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Admin Access:</strong> This dashboard is exclusively for authorized administrators. 
                If you believe you should have access, please use the admin login portal to authenticate with your authorized credentials.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="default"
                className="h-12 w-full text-base font-semibold"
                onClick={() => navigate({ to: '/admin-login' })}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Go to Admin Login
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full text-base font-semibold"
                onClick={() => navigate({ to: '/' })}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage products and orders for Tenro</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products" className="text-base">Products</TabsTrigger>
          <TabsTrigger value="orders" className="text-base">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
