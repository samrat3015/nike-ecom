import React from "react";
import Link from "next/link";
import Image from "next/image";

const ProductCard = ({ product }) => {
    return (
        <div className="card bg-base-100">
            <div className="card-image relative aspect-square overflow-hidden">
                <Link href={`/product/${product.slug}`}><img src={product.feature_image} alt="" className="w-full h-full object-cover" /></Link>
            </div>
            <div className="card-body pt-3">
                <Link href={`/product/${product.slug}`}><h2 className="card-title font-semibold text-sm md:text-base">{product.name}</h2></Link>
                <div className="price_area text-[12px] pt-1">
                    <p>TK. {product.price} 
                        {product?.previous_price && product?.previous_price > 0 && (
                            <span className="line-through text-gray-600 pl-1">TK. ({product.previous_price})</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
};
export default ProductCard;
