import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ShoppingBag, Truck, Shield } from 'lucide-react';
import { useGetProducts } from '../hooks/useQueries';

export default function HomePage() {
  const { data: products = [] } = useGetProducts();
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1200x600.jpg"
          alt="Tenro Collection"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="container relative flex h-full items-center">
          <div className="max-w-2xl space-y-6 text-white">
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Elevate Your Style
            </h1>
            <p className="text-xl text-white/90 md:text-2xl">
              Discover premium clothing that defines modern elegance and comfort.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild className="bg-white text-black hover:bg-white/90">
                <Link to="/products">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Premium Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Carefully crafted with the finest materials for lasting comfort.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Fast Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  Free shipping on orders over $100. Delivered to your door.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Shop with confidence using our secure payment system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Featured Collection</h2>
            <p className="text-lg text-muted-foreground">
              Explore our handpicked selection of premium clothing
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <Link key={product.id} to="/products/$productId" params={{ productId: product.id }}>
                <Card className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.images[0]?.getDirectURL() || '/assets/generated/black-tshirt.dim_800x800.jpg'}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="mb-2 font-semibold">{product.name}</h3>
                    <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <p className="text-lg font-bold">${(Number(product.price) / 100).toFixed(2)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link to="/products">
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <img
                src="/assets/generated/brand-story.dim_800x400.jpg"
                alt="Tenro Brand Story"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Our Story</h2>
              <p className="text-lg text-muted-foreground">
                Founded in 2025, Tenro represents the perfect blend of contemporary design and timeless elegance.
                We believe that clothing should not only look good but feel exceptional.
              </p>
              <p className="text-lg text-muted-foreground">
                Every piece in our collection is thoughtfully designed and crafted with premium materials,
                ensuring you look and feel your best every day.
              </p>
              <Button size="lg" variant="outline">
                Learn More About Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Preview */}
      <section className="py-16">
        <div className="container">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src="/assets/generated/autumn-collection.dim_1000x500.jpg"
              alt="Autumn Collection"
              className="h-[400px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <div className="max-w-lg space-y-4 text-white">
                  <h2 className="text-4xl font-bold">New Autumn Collection</h2>
                  <p className="text-lg">Embrace the season with our latest arrivals</p>
                  <Button size="lg" className="bg-white text-black hover:bg-white/90">
                    <Link to="/products">Explore Collection</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
