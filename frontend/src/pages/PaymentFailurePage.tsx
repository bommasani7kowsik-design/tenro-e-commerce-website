import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-md">
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
            <h1 className="mb-2 text-2xl font-bold">Payment Failed</h1>
            <p className="mb-6 text-muted-foreground">
              Your payment was not successful. Please try again or contact support if the problem persists.
            </p>
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link to="/checkout">Try Again</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/cart">Back to Cart</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
