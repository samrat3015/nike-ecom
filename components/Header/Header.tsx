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
import { Search, ChevronDown, ChevronRight, X, Menu } from "lucide-react";

// TypeScript interfaces for better type safety
interface Category {
  id: string | number;
  name: string;
  slug?: string;
  image?: string;
  icon?: string;
  order?: number;
  status?: string;
  parent_id?: string | number | null;
  children?: Category[];
}

interface Settings {
  top_notice?: string;
}

interface Media {
  logo?: string;
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

// Mobile Menu Item Component
const MobileMenuItem: React.FC<{ category: Category; onClose: () => void }> = ({
  category,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  const toggleOpen = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center justify-between">
        <Link
          href={generateCategoryUrl(category)}
          className="flex-1 py-3 px-4 text-gray-800 hover:text-blue-600 transition-colors"
          onClick={onClose}
        >
          {category.name}
        </Link>
        {hasChildren && (
          <button
            onClick={toggleOpen}
            className="p-3 text-gray-600 hover:text-gray-800"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-90" : ""
              }`}
            />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-gray-50"
          >
            <div className="pl-4">
              {category.children!.map((child) => (
                <MobileMenuItem
                  key={child.id}
                  category={child}
                  onClose={onClose}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mobile Sidebar Component
const MobileSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  logo?: string;
}> = ({ isOpen, onClose, categories, logo }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-xl overflow-y-auto"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="logo_area">
                {logo ? (
                  <img
                    src={logo}
                    alt="Company Logo"
                    className="h-8 object-contain"
                  />
                ) : (
                  <div className="text-lg font-bold text-gray-800">Menu</div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="py-2">
              <div className="px-4 py-3 border-b border-gray-200">
                <Link
                  href="/"
                  className="text-gray-800 hover:text-blue-600 transition-colors font-medium"
                  onClick={onClose}
                >
                  Home
                </Link>
              </div>

              {categories.map((category) => (
                <MobileMenuItem
                  key={category.id}
                  category={category}
                  onClose={onClose}
                />
              ))}

              <div className="px-4 py-3 border-b border-gray-200">
                <Link
                  href="/products"
                  className="text-gray-800 hover:text-blue-600 transition-colors font-medium"
                  onClick={onClose}
                >
                  All Products
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Function to collect all category IDs from a category and its children
const getAllCategoryIds = (category: Category): (string | number)[] => {
  let ids: (string | number)[] = [];

  // Add the current category ID if it exists
  if (category.id) {
    ids.push(category.id);
  }

  // Add all child category IDs recursively
  if (category.children && category.children.length > 0) {
    category.children.forEach((child) => {
      ids = [...ids, ...getAllCategoryIds(child)];
    });
  }

  return ids;
};

// Function to generate URL with all category IDs
const generateCategoryUrl = (category: Category): string => {
  if (!category.slug) {
    return "";
  }

  // Get all category IDs (current + children)
  const allCategoryIds = getAllCategoryIds(category);

  // Build the URL
  let url = `/products?category_slug=${category.slug}`;

  // Add all category IDs to the URL
  allCategoryIds.forEach((id) => {
    url += `&category_ids=${id}`;
  });

  return url;
};

// Desktop Mega Menu Component
const MegaMenu: React.FC<{
  category: Category;
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ category, isVisible, onMouseEnter, onMouseLeave }) => {
  const hasThirdLevel = category.children?.some(
    (child) => child.children && child.children.length > 0
  );

  if (!hasThirdLevel) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed top-[calc(100%)] left-0 w-full bg-white shadow-lg border-t border-gray-200 z-30"
          style={{
            top: "var(--header-height, 110px)", // Adjust based on your header height
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex gap-2 justify-center">
              {category.children?.map((subCategory) => (
                <div key={subCategory.id} className="w-[20%]">
                  <Link
                    href={generateCategoryUrl(subCategory)}
                    className="block font-semibold text-gray-900 hover:text-blue-600 transition-colors text-lg"
                  >
                    {subCategory.name}
                  </Link>

                  {subCategory.children && subCategory.children.length > 0 && (
                    <ul className="space-y-2">
                      {subCategory.children.map((thirdLevel) => (
                        <li key={thirdLevel.id}>
                          <Link
                            href={generateCategoryUrl(thirdLevel)}
                            className="text-gray-600 hover:text-blue-600 transition-colors block py-1"
                          >
                            {thirdLevel.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Desktop Menu Item Component
const DesktopMenuItem: React.FC<{ category: Category }> = ({ category }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const hasChildren = category.children && category.children.length > 0;
  const hasThirdLevel = category.children?.some(
    (child) => child.children && child.children.length > 0
  );

  const handleMouseEnter = () => {
    if (hasThirdLevel) {
      // Clear any existing timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (hasThirdLevel) {
      // Set a delay before hiding
      const timeout = setTimeout(() => {
        setIsHovered(false);
      }, 300); // 300ms delay
      setHideTimeout(timeout);
    }
  };

  const handleMegaMenuMouseEnter = () => {
    // Clear timeout when mouse enters mega menu
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  };

  const handleMegaMenuMouseLeave = () => {
    // Hide immediately when leaving mega menu
    setIsHovered(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  return (
    <li
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={generateCategoryUrl(category)}
        className="flex items-center gap-1 hover:text-blue-600 transition-colors duration-200"
      >
        {category.name}
        {hasChildren && <ChevronDown className="w-4 h-4" />}
      </Link>

      {/* Simple Dropdown for 2-level categories */}
      {hasChildren && !hasThirdLevel && (
        <div className="absolute top-full left-0 bg-white shadow-lg border border-gray-200 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-48 z-20">
          <div className="py-2">
            {category.children!.map((child) => (
              <Link
                key={child.id}
                href={generateCategoryUrl(child)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mega Menu for 3+ level categories */}
      <MegaMenu
        category={category}
        isVisible={isHovered}
        onMouseEnter={handleMegaMenuMouseEnter}
        onMouseLeave={handleMegaMenuMouseLeave}
      />
    </li>
  );
};

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

  const { items_count = 0 } = useSelector(
    (state: RootState) => state.cart ?? {}
  );

  useEffect(() => {
    dispatch(fetchCategories() as any);
    dispatch(fetchSettings() as any);
    dispatch(fetchCart() as any);
  }, [dispatch]);

  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenSearch = () => setIsOpenSearch(true);
  const handleCloseSearch = () => setIsOpenSearch(false);
  const handleToggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        // xl breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
                    <div
                      key={i}
                      className="h-6 bg-gray-300 rounded animate-pulse w-20"
                    ></div>
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

  // Main header component
  return (
    <div className="header_area relative z-50">
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

      {/* Desktop Header */}
      <div className="border-b hidden xl:block border-gray-200">
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
                  <div className="text-xl font-bold text-gray-800 w-[120px] animate-pulse"></div>
                )}
              </Link>
            </div>

            {/* Desktop Navigation menu */}
            <div className="main_menu">
              <nav>
                <ul className="flex gap-6">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-blue-600 transition-colors duration-200"
                    >
                      Home
                    </Link>
                  </li>
                  {categories && categories.length > 0
                    ? categories.map((category: Category) => (
                        <DesktopMenuItem
                          key={category.id}
                          category={category}
                        />
                      ))
                    : null}
                  <li>
                    <Link
                      href="/products"
                      className="hover:text-blue-600 transition-colors duration-200"
                    >
                      All Products
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Cart and user actions */}
            <div className="right_area flex items-center gap-4">
              <button
                onClick={handleOpenSearch}
                suppressHydrationWarning
                className="flex cursor-pointer gap-2 w-[180px] h-[40px] items-center pr-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200"
              >
                <div className="search_icon w-10 h-10 flex justify-center items-center hover:bg-white transition-all duration-200 rounded-full">
                  <Search />
                </div>
                <span>Search</span>
              </button>
              {/* Cart */}
              <Link href="/cart" className="block">
                <div className="relative hover:bg-gray-100 w-[40px] h-[40px] transition-all duration-200 rounded-full flex justify-center items-center group">
                  <CartIcon />
                  {items_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white w-5 h-5 flex justify-center items-center rounded-full text-xs font-medium min-w-[20px]">
                      {items_count > 99 ? "99+" : items_count}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="border-b border-gray-200 xl:hidden">
        <div className="container">
          <div className="flex justify-between items-center py-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={handleToggleMobileMenu}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                data-v-44281fb5=""
                data-v-68fa2a2f=""
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="16"
                viewBox="0 0 30 16"
                fill="currentColor"
              >
                <rect
                  data-v-44281fb5=""
                  data-v-68fa2a2f=""
                  width="30"
                  height="1.5"
                ></rect>
                <rect
                  data-v-44281fb5=""
                  data-v-68fa2a2f=""
                  y="7"
                  width="20"
                  height="1.5"
                ></rect>
                <rect
                  data-v-44281fb5=""
                  data-v-68fa2a2f=""
                  y="14"
                  width="30"
                  height="1.5"
                ></rect>
              </svg>
            </button>

            {/* Mobile Logo */}
            <div className="logo_area w-[100px]">
              <Link href="/" className="block">
                {media?.logo ? (
                  <img
                    src={media.logo}
                    alt="Company Logo"
                    className="w-full h-auto max-h-12 object-contain"
                  />
                ) : (
                  <div className="text-xl font-bold text-gray-800 w-[120px] animate-pulse"></div>
                )}
              </Link>
            </div>

            {/* Mobile Right Actions */}
            <div className="right_area flex items-center gap-0 sm:gap-2 md:gap-4">
              <button
                onClick={handleOpenSearch}
                suppressHydrationWarning
                className="flex cursor-pointer gap-2 items-center p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200"
              >
                <span>
                  <Search />
                </span>
              </button>
              {/* Cart */}
              <Link href="/cart" className="block">
                <div className="relative hover:bg-gray-100 w-[40px] h-[40px] transition-all duration-200 rounded-full flex justify-center items-center group">
                  <CartIcon />
                  {items_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white w-5 h-5 flex justify-center items-center rounded-full text-xs font-medium min-w-[20px]">
                      {items_count > 99 ? "99+" : items_count}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        categories={categories}
        logo={media?.logo}
      />

      {/* Search Modal */}
      <AnimatePresence>
        {isOpenSearch && (
          <motion.div
            key="search-modal"
            initial={{ opacity: 0, y: 50, x: 100, width: 0 }}
            animate={{ opacity: 1, y: 0, x: 0, width: "100%" }}
            exit={{ opacity: 0, y: 0, x: 100, width: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
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
