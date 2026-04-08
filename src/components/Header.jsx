import { Link } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, handleLogout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link
          to="/"
          className="font-heading text-2xl font-bold tracking-wider text-gradient"
        >
          CREST<span className="text-foreground">WALK</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Trang chủ
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sản phẩm
          </Link>
          <Link
            to="/order-tracking"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Tra cứu đơn hàng
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Về chúng tôi
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/products"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-5 w-5" />
          </Link>
          {!isLoading && isAuthenticated && user ? (
            <div className="relative group">
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
              </Link>

              {/* Dropdown menu on hover */}
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.full_name || "Người dùng"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Hồ sơ của tôi
                  </Link>
                  <Link
                    to="/profile?tab=orders"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Đơn hàng
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            !isLoading && (
              <Link
                to="/auth"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="h-5 w-5" />
              </Link>
            )
          )}

          <Link
            to="/wishlist"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Heart className="h-5 w-5" />
          </Link>

          <Link
            to="/cart"
            className="relative text-muted-foreground hover:text-foreground transition-colors"
          >
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
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-up">
          <nav className="container flex flex-col gap-4 py-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Trang chủ
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Sản phẩm
            </Link>
            <Link
              to="/order-tracking"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Tra cứu đơn hàng
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Về chúng tôi
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
