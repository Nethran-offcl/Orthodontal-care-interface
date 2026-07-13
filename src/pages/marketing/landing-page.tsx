import { MarketingNav } from '@/pages/marketing/sections/marketing-nav'
import { Hero } from '@/pages/marketing/sections/hero'
import { ProductOverview } from '@/pages/marketing/sections/product-overview'
import { AiFeatures } from '@/pages/marketing/sections/ai-features'
import { ProductPreview } from '@/pages/marketing/sections/product-preview'
import { Testimonials } from '@/pages/marketing/sections/testimonials'
import { Pricing } from '@/pages/marketing/sections/pricing'
import { Contact } from '@/pages/marketing/sections/contact'
import { CtaBanner } from '@/pages/marketing/sections/cta-banner'
import { Footer } from '@/pages/marketing/sections/footer'

export function LandingPage() {
  return (
    <div className="min-h-svh w-full bg-background">
      <MarketingNav />
      <Hero />
      <ProductOverview />
      <AiFeatures />
      <ProductPreview />
      <Testimonials />
      <Pricing />
      <Contact />
      <CtaBanner />
      <Footer />
    </div>
  )
}
