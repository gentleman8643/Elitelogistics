import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  Globe2,
  Clock,
  Headphones,
  PackageCheck,
  Truck,
  Ship,
  Plane,
  Warehouse,
  Zap,
  Package,
  Home as HomeIcon,
  MapPin,
  TrendingUp,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrackingSearch } from '@/components/tracking-search';
import { SERVICES, FAQS } from '@/lib/constants';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const HERO_IMAGE =
  'https://images.pexels.com/photos/6572432/pexels-photo-6572432.jpeg?auto=compress&cs=tinysrgb&w=1920';

const WHY_CHOOSE_US = [
  {
    icon: Globe2,
    title: 'Global Network',
    description: 'Strategic hubs on every major trade route, connecting origins and destinations worldwide.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Reliable',
    description: 'Advanced tracking technology and comprehensive insurance on every shipment.',
  },
  {
    icon: Clock,
    title: 'On-Time Delivery',
    description: 'Time-definite service options with reliable scheduling and proactive delay communication.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated logistics specialists available around the clock for your shipments.',
  },
];

const STATS = [
  { value: '24/7', label: 'Support Available', icon: Clock },
  { value: '8', label: 'Service Types', icon: PackageCheck },
  { value: '100%', label: 'Tracked Shipments', icon: ShieldCheck },
  { value: 'Global', label: 'Coverage Area', icon: Globe2 },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Shipment', description: 'Our team prepares your shipment with all necessary documentation and tracking setup.' },
  { step: '02', title: 'Receive Tracking Number', description: 'Get a unique tracking number to monitor your shipment at every stage of its journey.' },
  { step: '03', title: 'Track in Real-Time', description: 'Enter your tracking number on our platform to see live status updates and location information.' },
  { step: '04', title: 'Delivery Confirmed', description: 'Receive confirmation when your shipment reaches its destination safely and on schedule.' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Supply Chain Director, TechFlow Inc.',
    rating: 5,
    text: 'Elite Logistics has transformed how we manage our international shipping. The real-time tracking is exceptional, and their team is incredibly responsive.',
  },
  {
    name: 'James Okonkwo',
    role: 'Operations Manager, GlobalTrade Co.',
    rating: 5,
    text: 'Reliable, professional, and always on time. We have been shipping with Elite Logistics for three years and they have never let us down. The tracking system gives us complete visibility.',
  },
  {
    name: 'Maria Rodriguez',
    role: 'Logistics Lead, NorthStar Retail',
    rating: 5,
    text: 'The level of detail in their tracking updates is unmatched. Our customers love knowing exactly where their packages are. Elite Logistics is a true logistics partner.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[600px] items-center overflow-hidden bg-slate-900 lg:min-h-[680px]">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Cargo containers loaded on a ship at port"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-primary/30">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              Professional logistics & shipment tracking
            </div>
            <h1 className="text-balance text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Moving What Matters, Wherever It Needs to Go.
            </h1>
            <p className="mt-6 text-balance text-lg text-slate-300">
              Global logistics and shipment tracking solutions trusted by businesses
              worldwide. From air freight to ocean cargo, we deliver with precision and care.
            </p>

            <div className="mt-8 max-w-xl rounded-xl bg-white/95 p-4 shadow-2xl backdrop-blur sm:p-5">
              <p className="mb-3 text-sm font-medium text-foreground">Track your shipment</p>
              <TrackingSearch large />
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" variant="secondary">
                <Link href="/services">
                  Explore Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/about">Learn About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-border bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center sm:flex-row sm:gap-3 sm:text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground sm:text-2xl">{stat.value}</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Who We Are</p>
              <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
                A Global Logistics Partner You Can Trust
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Elite Logistics is a global freight forwarding and supply chain
                management company. We combine industry expertise with cutting-edge
                technology to deliver seamless logistics solutions.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Our integrated network spans air, ocean, and ground transportation, supported
                by state-of-the-art warehousing and real-time tracking systems. We handle every
                shipment with the same commitment to excellence, whether it is a single package
                or a full container load.
              </p>
              <div className="mt-8 flex gap-4">
                <Button asChild>
                  <Link href="/about">
                    About Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] overflow-hidden rounded-2xl">
              <Image
                src="https://images.pexels.com/photos/4484073/pexels-photo-4484073.jpeg?auto=compress&cs=tinysrgb&w=1260"
                alt="Warehouse logistics team"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Why Choose Us</p>
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Built for Reliability, Designed for Scale
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We deliver logistics excellence through technology, expertise, and an unwavering commitment to customer success.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CHOOSE_US.map((item) => (
              <Card key={item.title} className="border-border/60 transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Our Services</p>
              <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Comprehensive Logistics Solutions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From air freight to warehousing, we offer end-to-end logistics services tailored to your needs.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/services">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.slice(0, 4).map((service) => (
              <Link key={service.type} href={`/services#${service.type}`}>
                <Card className="group h-full overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/95">
                      <service.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                    <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                      Learn More
                      <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How Tracking Works */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">How It Works</p>
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Shipment Tracking Made Simple
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Follow your shipment every step of the way with our intuitive tracking system.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white text-lg font-bold">
                  {item.step}
                </div>
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute left-14 top-7 hidden h-px w-full bg-border lg:block" />
                )}
                <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracking CTA */}
      <section className="relative overflow-hidden bg-primary py-20">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://images.pexels.com/photos/2231744/pexels-photo-2231744.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Cargo port"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-bold text-white sm:text-4xl">
            Track Your Shipment Now
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/90">
            Enter your tracking number to see real-time updates on your shipment's journey.
          </p>
          <div className="mx-auto mt-8 max-w-xl rounded-xl bg-white p-4 shadow-2xl">
            <TrackingSearch large />
          </div>
        </div>
      </section>

      {/* Global Capabilities */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative h-[400px] overflow-hidden rounded-2xl order-2 lg:order-1">
              <Image
                src="https://images.pexels.com/photos/33692749/pexels-photo-33692749.jpeg?auto=compress&cs=tinysrgb&w=1260"
                alt="Stacked shipping containers at port"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Global Capabilities</p>
              <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Connecting Every Corner of the World
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Our integrated logistics network combines air, ocean, and ground transportation
                to deliver your cargo efficiently, no matter the destination.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { icon: Plane, label: 'Air Freight', value: 'Express options' },
                  { icon: Ship, label: 'Ocean Freight', value: 'FCL & LCL' },
                  { icon: Truck, label: 'Road Transport', value: 'Cross-border' },
                  { icon: Warehouse, label: 'Warehousing', value: 'Pick & pack' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</p>
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              What Our Clients Say
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-border/60">
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-base leading-relaxed text-foreground">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/faq">
                View All FAQs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-bold text-white sm:text-4xl">
            Ready to Ship with Confidence?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Get in touch with our logistics team to discuss your shipping needs and discover how we can streamline your supply chain.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/track">Track a Shipment</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
