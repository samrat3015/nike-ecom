import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  slug: string;
  feature_image: string;
  price: string | number;
  previous_price?: string | number;
  category?: {
    slug?: string;
  };
  [key: string]: any;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    if (!product || !product.slug || !product.name) {
        return null;
    }

    return (
        <div className="card bg-base-100">
            <div className="card-image relative aspect-square overflow-hidden">
                <Link href={`/product/${product.slug}`}>
                    {product.feature_image ? (
                        <img 
                            loading="lazy" 
                            src={product.feature_image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                        </div>
                    )}
                </Link>
            </div>
            <div className="card-body pt-3">
                <Link href={`/product/${product.slug}`}>
                    <h2 className="card-title font-semibold text-sm md:text-base">{product.name}</h2>
                </Link>
                <div className="price_area text-[12px] sm:text-base pt-1">
                    <p>
                        <span className="font-medium">TK. {product.price || 'N/A'}</span>
                        {product?.previous_price && Number(product.previous_price) > 0 && (
                            <span className="line-through text-gray-600 pl-1">
                                TK. ({product.previous_price})
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
};
export default ProductCard;
