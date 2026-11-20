import { Hero } from "@/components/hero";
import { EmergencyLighting } from "@/components/emergency-lighting";
import { Benefits } from "@/components/benefits";
import { Usage } from "@/components/usage";
import { ProductDetails } from "@/components/product-details";
import { SpecialOffer } from "@/components/special-offer";
import { Delivery } from "@/components/delivery";
import { OrderForm } from "@/components/order-form";
import { MobileOrderBar } from "@/components/mobile-order-bar";
import { productStructuredData } from "@/lib/site";

export default function Home() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData()).replace(/</g, "\\u003c") }} /><main><Hero /><EmergencyLighting /><Benefits /><Usage /><ProductDetails /><SpecialOffer /><Delivery /><OrderForm /></main><MobileOrderBar /></>;
}
