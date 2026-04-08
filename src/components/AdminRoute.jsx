import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const AdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin") && !hasShownToast.current) {
      toast.error("Bạn không có quyền truy cập vào trang quản trị!");
      hasShownToast.current = true;
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
