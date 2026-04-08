import Layout from "@/components/Layout";

const About = () => {
  return (
    <Layout>
      <div className="container py-16 md:py-24 max-w-3xl">
        <h1 className="font-heading text-4xl font-bold mb-6">Về chúng tôi</h1>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Crest Walk là điểm đến cho những ai yêu sneaker chính hãng — nơi bạn có thể
          khám phá, lựa chọn và đặt mua sản phẩm với trải nghiệm mua sắm rõ ràng, an
          tâm.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Chúng tôi cam kết hàng authentic, giao hàng nhanh và hỗ trợ khách hàng trong
          suốt quá trình mua hàng.
        </p>
      </div>
    </Layout>
  );
};

export default About;
