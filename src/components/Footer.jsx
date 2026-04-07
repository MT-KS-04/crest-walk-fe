import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading text-xl font-bold text-gradient mb-4">SNEAKERSTORE</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cửa hàng giày sneaker chính hãng hàng đầu Việt Nam. Cam kết 100% authentic.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold mb-4">SẢN PHẨM</h4>
            <div className="flex flex-col gap-2">
              <Link to="/products?category=Running" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Running</Link>
              <Link to="/products?category=Basketball" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Basketball</Link>
              <Link to="/products?category=Lifestyle" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Lifestyle</Link>
              <Link to="/products?category=Training" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Training</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold mb-4">HỖ TRỢ</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Hướng dẫn mua hàng</span>
              <span className="text-sm text-muted-foreground">Chính sách đổi trả</span>
              <span className="text-sm text-muted-foreground">Chính sách bảo hành</span>
              <span className="text-sm text-muted-foreground">Liên hệ</span>
            </div>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold mb-4">LIÊN HỆ</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>📍 123 Nguyễn Huệ, Q.1, TP.HCM</span>
              <span>📞 0901 234 567</span>
              <span>✉️ info@sneakerstore.vn</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2026 SneakerStore. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
