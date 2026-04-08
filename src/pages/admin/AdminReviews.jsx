import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Star, CheckCircle, XCircle, Search } from "lucide-react";
import { toast } from "sonner";
import adminReviewsApi from "@/api/adminReviews.api";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState(null);

  const fetchReviews = async () => {
    setIsFetching(true);
    try {
      const data = await adminReviewsApi.list({
        status: filter || undefined,
        page: 1,
        limit: 200,
      });
      setReviews(Array.isArray(data?.data?.reviews) ? data.data.reviews : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không tải được đánh giá.");
      setReviews([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filtered = useMemo(() => reviews.filter((r) => {
    const matchStatus = !filter || r.status === filter;
    const fullName = `${r?.user_id?.first_name || ""} ${r?.user_id?.last_name || ""}`.trim();
    const productName = r?.product_id?.name || "";
    const comment = r?.comment || "";
    const q = search.toLowerCase();
    const matchSearch = !search || fullName.toLowerCase().includes(q) || productName.toLowerCase().includes(q) || comment.toLowerCase().includes(q);
    const matchRating = ratingFilter === null || r.rating === ratingFilter;
    return matchStatus && matchSearch && matchRating;
  }), [reviews, filter, search, ratingFilter]);

  const updateStatus = async (id, status) => {
    try {
      await adminReviewsApi.updateStatus(id, status);
      toast.success(status === "approved" ? "Đã duyệt đánh giá!" : "Đã từ chối đánh giá!");
      await fetchReviews();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cập nhật trạng thái thất bại.");
    }
  };

  const handleDelete = async (id) => {
    const ok = confirm("Xóa đánh giá này?");
    if (!ok) return;
    try {
      await adminReviewsApi.remove(id);
      toast.success("Đã xóa đánh giá!");
      await fetchReviews();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Xóa đánh giá thất bại.");
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-3xl font-bold mb-6">QUẢN LÝ ĐÁNH GIÁ</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Tìm theo tên, sản phẩm, nội dung..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select value={ratingFilter ?? ""} onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Tất cả sao</option>
          {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s} sao</option>)}
        </select>
      </div>

      <div className="flex gap-2 mb-6">
        {[{ label: "Tất cả", value: "" }, { label: "Chờ duyệt", value: "pending" }, { label: "Đã duyệt", value: "approved" }, { label: "Từ chối", value: "rejected" }].map((opt) => (
          <button key={opt.value} onClick={() => setFilter(opt.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${filter === opt.value ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
            {opt.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} đánh giá</p>

      <div className="space-y-4">
        {isFetching ? (
          <p className="text-center text-muted-foreground py-8">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Không tìm thấy đánh giá nào.</p>
        ) : filtered.map((review) => (
          <div key={review._id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-sm">{`${review?.user_id?.first_name || ""} ${review?.user_id?.last_name || ""}`.trim() || review?.user_id?.email || "Anonymous"}</span>
                  <span className="text-xs text-muted-foreground">→ {review?.product_id?.name || "-"}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    review.status === "approved" ? "bg-green-500/10 text-green-400" :
                    review.status === "rejected" ? "bg-red-500/10 text-red-400" :
                    "bg-yellow-500/10 text-yellow-400"
                  }`}>
                    {review.status === "approved" ? "Đã duyệt" : review.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {review.createdAt ? new Date(review.createdAt).toLocaleString("vi-VN") : "-"}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                {review.status === "pending" && (
                  <>
                  <button onClick={() => updateStatus(review._id, "approved")}
                    className="p-2 rounded-lg hover:bg-green-500/10 text-muted-foreground hover:text-green-400" title="Duyệt">
                    <CheckCircle className="h-5 w-5" />
                  </button>
                  <button onClick={() => updateStatus(review._id, "rejected")}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400" title="Từ chối">
                    <XCircle className="h-5 w-5" />
                  </button>
                  </>
                )}
                <button onClick={() => handleDelete(review._id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400" title="Xóa">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
