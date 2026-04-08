import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { handleLogin, handleRegister, isLoading } = useAuth();

  // Login form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const result = await handleLogin(loginForm.email, loginForm.password);
      toast.success("Đăng nhập thành công!");
      
      const role = result?.data?.user?.role;
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      toast.error(message);
    }
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    if (
      !registerForm.fullName ||
      !registerForm.email ||
      !registerForm.password
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (registerForm.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      await handleRegister({
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
      });
      toast.success("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");
      setIsLogin(true);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error(message);
    }
  };

  return (
    <Layout>
      <div className="container flex items-center justify-center py-12 min-h-[70vh]">
        <div className="w-full max-w-md">
          {/* Toggle */}
          <div className="flex rounded-xl border border-border bg-card p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${
                isLogin
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${
                !isLogin
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Đăng ký
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleSubmitLogin} className="space-y-5">
              <div className="text-center mb-6">
                <h1 className="font-heading text-3xl font-bold uppercase">
                  Chào mừng trở lại
                </h1>
                <p className="text-muted-foreground text-sm mt-2">
                  Đăng nhập để tiếp tục mua sắm
                </p>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  className="pl-10 bg-secondary border-border"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  className="pl-10 pr-10 bg-secondary border-border"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}{" "}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-4 text-muted-foreground">
                    hoặc đăng nhập với
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm hover:bg-secondary transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm hover:bg-secondary transition-colors"
                >
                  <svg className="h-5 w-5 fill-foreground" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitRegister} className="space-y-5">
              <div className="text-center mb-6">
                <h1 className="font-heading text-3xl font-bold uppercase">
                  Tạo tài khoản
                </h1>
                <p className="text-muted-foreground text-sm mt-2">
                  Đăng ký để nhận ưu đãi độc quyền
                </p>
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Họ và tên *"
                  className="pl-10 bg-secondary border-border"
                  value={registerForm.fullName}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email *"
                  className="pl-10 bg-secondary border-border"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Số điện thoại"
                  className="pl-10 bg-secondary border-border"
                  value={registerForm.phone}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, phone: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu *"
                  className="pl-10 pr-10 bg-secondary border-border"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu *"
                  className="pl-10 pr-10 bg-secondary border-border"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang xử lý..." : "Đăng ký"}{" "}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
