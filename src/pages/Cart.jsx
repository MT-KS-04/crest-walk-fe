import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react";
import Layout from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/products";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold mb-4">GIỎ HÀNG TRỐNG</h1>
          <p className="text-muted-foreground mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-fire px-8 py-3 text-sm font-semibold text-primary-foreground hover:shadow-glow transition-all"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Tiếp tục mua sắm
        </Link>

        <h1 className="font-heading text-4xl font-bold mb-8">GIỎ HÀNG</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.size}`}
                className="flex gap-4 rounded-xl border border-border bg-card p-4"
              >
                <Link to={`/product/${item.product.id}`} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                  <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">{item.product.brand}</p>
                      <h3 className="font-heading text-sm font-semibold truncate">{item.product.name}</h3>
                      <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="inline-flex items-center rounded-lg border border-border">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="flex h-8 w-8 items-center justify-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-border bg-card p-6 h-fit sticky top-24">
            <h3 className="font-heading text-lg font-semibold mb-6">TÓM TẮT ĐƠN HÀNG</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span className="text-primary">{totalPrice >= 1000000 ? "Miễn phí" : formatPrice(30000)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold">
                <span>Tổng cộng</span>
                <span className="text-primary text-lg">
                  {formatPrice(totalPrice + (totalPrice >= 1000000 ? 0 : 30000))}
                </span>
              </div>
            </div>
            <button className="w-full rounded-full bg-gradient-fire py-4 text-sm font-semibold text-primary-foreground hover:shadow-glow transition-all">
              Đặt hàng
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-3 rounded-full border border-border py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Xóa giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
