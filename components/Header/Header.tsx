"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/store/slices/categoriesSlice";
import MenuItem from "./MenuItem";
import {fetchSettings} from "@/store/slices/settingsSlice";
import { fetchCart } from "@/store/slices/cartSlice";
import Link from "next/link";
import CartIcon from "../Icons/CartIcon";

const Header = () => {
  const dispatch = useDispatch();
const { items: categories, loading: categoriesLoading, error: categoriesError } =
  useSelector((state: any) => state.categories ?? {});

const { settings, media, loading: settingsLoading, error: settingsError } =
  useSelector((state: any) => state.settings ?? {});


const { items_count } = useSelector((state: any) => state.cart);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSettings());
    dispatch(fetchCart());
  }, [dispatch]);

  if (categoriesLoading || settingsLoading) return false;
  if (categoriesError || settingsError) return false;

  return (
    <div className="header_area relative z-10">
      
      <div className="header_top bg-black py-2">
        <div className="container">
          <div className="flex justify-between text-white">
            <div className="top_notice">
              <p>{settings?.top_notice}</p>
            </div>
            <div className="top_login">
              <Link href="/login" className="hover:underline text-white" >login</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="header_inner_wrapper flex justify-between items-center py-3">
          <div className="logo_area w-[100px]">
            <Link href="/"><img src={media?.logo} alt="logo" /></Link>
          </div>
          <div className="main_menu">
            <nav>
              <ul className="flex gap-4">
                {categories.map((category: any) => (
                  <MenuItem key={category.id} category={category} />
                ))}
              </ul>
            </nav>
          </div>
          <div className="right_area">
            <Link href="/cart">
              <div className="relative hover:bg-gray-200 w-[40px] h-[40px] transition-all rounded-full flex justify-center items-center">
                <CartIcon />
                <span className="absolute top-[0] right-[0] bg-black text-white w-5 h-5 flex justify-center items-center rounded-full">{items_count}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
