import React from "react";
import Slider from "@/components/Slider/Slider";
import HomeProducts from "@/components/Product/HomeProducts";
import TopCategory from "@/components/Category/TopCategory";

export const metadata = {
  title: "Home", // Will become "Home - Next js Ecommerce"
};

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div>
      <Slider />
      <TopCategory />
      <HomeProducts />
    </div>
  );
}
