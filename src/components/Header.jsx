import { Link } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const Header = () => {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-heading text-2xl font-bold tracking-wider text-gradient">
          SNEAKER<span className="text-foreground">STORE</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Trang chủ
          </Link>
          <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sản phẩm
          </Link>
          <Link to="/products?category=Running" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Running
          </Link>
          <Link to="/products?category=Basketball" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Basketball
          </Link>
          <Link to="/products?category=Lifestyle" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Lifestyle
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/cart" className="relative text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="md:hidden text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-up">
          <nav className="container flex flex-col gap-4 py-4">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">Trang chủ</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">Sản phẩm</Link>
            <Link to="/products?category=Running" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">Running</Link>
            <Link to="/products?category=Basketball" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">Basketball</Link>
            <Link to="/products?category=Lifestyle" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">Lifestyle</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
