import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Purpose */}
          <div className="space-y-4 md:col-span-1">
            <span className="text-lg font-semibold tracking-tight text-text-primary">
              VALENCE
            </span>
            <p className="text-sm text-text-secondary leading-relaxed">
              Utilitarian objects, apparel, and hardware made for daily endurance. Designed in small runs with traceable supply lines.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium bg-success-tint text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                Services active on :8080
              </span>
            </div>
          </div>

          {/* Catalogue */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Catalogue</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/products" className="hover:text-text-primary transition-colors">
                  All Goods
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=1" className="hover:text-text-primary transition-colors">
                  Carrying Equipment
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=2" className="hover:text-text-primary transition-colors">
                  Technical Apparel
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=3" className="hover:text-text-primary transition-colors">
                  Desk & Workshop
                </Link>
              </li>
            </ul>
          </div>

          {/* Orders & Service */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Orders & Service</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/account/orders" className="hover:text-text-primary transition-colors">
                  Order History & Status
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-text-primary transition-colors">
                  Current Cart
                </Link>
              </li>
              <li>
                <Link href="/#dispatch" className="hover:text-text-primary transition-colors">
                  Dispatch Standards
                </Link>
              </li>
              <li>
                <Link href="/#dispatch" className="hover:text-text-primary transition-colors">
                  Returns & Guarantee
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational Infrastructure */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">System Notes</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Backed by Spring Cloud Gateway with distributed inventory consensus and Kafka dispatch queues.
            </p>
            <div className="pt-2 text-xs font-mono text-text-secondary space-y-1">
              <div>GATEWAY: http://localhost:8080</div>
              <div>REGISTRY: http://localhost:8761</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <p>© {new Date().getFullYear()} Valence Goods Co. All hardware specifications maintained.</p>
          <div className="flex items-center gap-6">
            <span>24h Order Dispatches</span>
            <span>Standard Domestic Transit</span>
            <span>Verified Stock Consignment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
