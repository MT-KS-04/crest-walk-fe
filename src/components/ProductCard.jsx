import { Link } from "react-router-dom";
import { formatPrice } from "@/data/products";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

const ProductCard = ({ product, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-lg bg-card aspect-square">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {product.isNew && (
            <span className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              Mới
            </span>
          )}
          {product.isSale && (
            <span className="absolute top-3 left-3 rounded-full bg-destructive px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">
              Sale
            </span>
          )}

          <button
            className="absolute top-3 right-3 rounded-full bg-background/50 p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-background/80"
            onClick={(e) => { e.preventDefault(); }}
          >
            <Heart className="h-4 w-4 text-foreground" />
          </button>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.brand}</p>
          <h3 className="font-heading text-sm font-semibold truncate">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
