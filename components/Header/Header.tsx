"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/store/slices/categoriesSlice";
import MenuItem from "./MenuItem";
import { fetchSettings } from "@/store/slices/settingsSlice";
import { fetchCart } from "@/store/slices/cartSlice";
import Link from "next/link";
import CartIcon from "../Icons/CartIcon";
import SearchModel from "./SearchModel";
import { motion, AnimatePresence } from "framer-motion";
import {Search} from "lucide-react";

// TypeScript interfaces for better type safety
interface Category {
  id: string;
  name: string;
  slug?: string;
  // Add other category properties as needed
}

interface Settings {
  top_notice?: string;
  // Add other settings properties as needed
}

interface Media {
  logo?: string;
  // Add other media properties as needed
}

interface RootState {
  categories: {
    items: Category[];
    loading: boolean;
    error: string | null;
  };
  settings: {
    settings: Settings;
    media: Media;
    loading: boolean;
    error: string | null;
  };
  cart: {
    items_count: number;
  };
}

const Header: React.FC = () => {
  const dispatch = useDispatch();
  
  const {
    items: categories = [],
    loading: categoriesLoading = false,
    error: categoriesError = null,
  } = useSelector((state: RootState) => state.categories ?? {});

  const {
    settings = {},
    media = {},
    loading: settingsLoading = false,
    error: settingsError = null,
  } = useSelector((state: RootState) => state.settings ?? {});

  const { items_count = 0 } = useSelector((state: RootState) => state.cart ?? {});

  useEffect(() => {
    dispatch(fetchCategories() as any);
    dispatch(fetchSettings() as any);
    dispatch(fetchCart() as any);
  }, [dispatch]);


  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const handleOpenSearch = () => setIsOpenSearch(true);
  const handleCloseSearch = () => setIsOpenSearch(false);





  // Loading state with skeleton
  if (categoriesLoading || settingsLoading) {
    return (
      <div className="header_area relative z-10">
        <div className="header_top bg-black py-2">
          <div className="container">
            <div className="flex justify-between text-white">
              <div className="top_notice">
                <div className="h-5 bg-gray-600 rounded animate-pulse w-48"></div>
              </div>
              <div className="top_login">
                <div className="h-5 bg-gray-600 rounded animate-pulse w-12"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200">
          <div className="container">
            <div className="header_inner_wrapper flex justify-between items-center py-3">
              <div className="logo_area w-[100px]">
                <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="main_menu">
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-6 bg-gray-300 rounded animate-pulse w-20"></div>
                  ))}
                </div>
              </div>
              <div className="right_area">
                <div className="w-[40px] h-[40px] bg-gray-300 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with minimal header
  if (categoriesError || settingsError) {
    return (
      <div className="header_area relative z-10">
        <div className="border-b border-gray-200">
          <div className="container">
            <div className="header_inner_wrapper flex justify-between items-center py-3">
              <div className="logo_area w-[100px]">
                <Link href="/">
                  <div className="text-xl font-bold">Logo</div>
                </Link>
              </div>
              <div className="main_menu">
                <nav>
                  <ul className="flex gap-4">
                    <li>
                      <Link href="/" className="hover:text-blue-600 transition-colors">
                        Home
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
              <div className="right_area">
                <Link href="/cart">
                  <div className="relative hover:bg-gray-200 w-[40px] h-[40px] transition-all rounded-full flex justify-center items-center">
                    <CartIcon />
                    <span className="absolute top-[0] right-[0] bg-black text-white w-5 h-5 flex justify-center items-center rounded-full text-xs">
                      {items_count}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main header component
  return (
    <div className="header_area relative z-10">
      {/* Top header bar */}
      <div className="header_top bg-black py-2">
        <div className="container">
          <div className="flex justify-between text-white">
            <div className="top_notice">
              <p className="text-sm">{settings?.top_notice}</p>
            </div>
            <div className="top_login">
              <Link 
                href="/login" 
                className="hover:underline text-white text-sm transition-all duration-200"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-gray-200">
        <div className="container">
          <div className="header_inner_wrapper flex justify-between items-center py-3">
            {/* Logo section */}
            <div className="logo_area w-[100px]">
              <Link href="/" className="block">
                {media?.logo ? (
                  <img 
                    src={media.logo} 
                    alt="Company Logo" 
                    className="w-full h-auto max-h-12 object-contain"
                  />
                ) : (
                  <div className="text-xl font-bold text-gray-800">Logo</div>
                )}
              </Link>
            </div>

            {/* Navigation menu */}
            <div className="main_menu">
              <nav>
                <ul className="flex gap-6">
                  {categories && categories.length > 0 ? (
                    categories.map((category: Category) => (
                      <MenuItem key={category.id} category={category} />
                    ))
                  ) : (
                    <li>
                      <Link 
                        href="/" 
                        className="hover:text-blue-600 transition-colors duration-200"
                      >
                        Home
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link rel="stylesheet" href="/products">All Products</Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Cart and user actions */}
            <div className="right_area flex items-center gap-4">
              <button onClick={handleOpenSearch} suppressHydrationWarning className="flex cursor-pointer gap-2 w-[180px] h-[40px] items-center pr-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200">
                <div className="search_icon w-10 h-10 flex justify-center items-center hover:bg-white transition-all duration-200 rounded-full">
                  <Search/>
                </div>
                <span>Search</span>
              </button>
              {/* Cart */}
              <Link href="/cart" className="block">
                <div className="relative hover:bg-gray-100 w-[40px] h-[40px] transition-all duration-200 rounded-full flex justify-center items-center group">
                  <CartIcon />
                  {items_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white w-5 h-5 flex justify-center items-center rounded-full text-xs font-medium min-w-[20px]">
                      {items_count > 99 ? '99+' : items_count}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>


    <AnimatePresence>
      {isOpenSearch && (
        <motion.div
          key="search-modal"
          initial={{ opacity: 0, y: 50, x: 100, width: 0 }}   // start: off by 100px + collapsed
          animate={{ opacity: 1, y: 0, x: 0, width: "100%" }} // animate: full width, at position 0
          exit={{ opacity: 0, y: 0, x: 100, width: 0 }}       // exit: slide out to right + collapse
          transition={{
            duration: 0.4,
            ease: "easeInOut"
          }}
          className="fixed top-0 right-0 bg-white shadow-lg header_search_model"
        >
          <SearchModel logo={media?.logo} onClose={handleCloseSearch} />
        </motion.div>
      )}
    </AnimatePresence>



      
      



    </div>
  );
};

export default Header;