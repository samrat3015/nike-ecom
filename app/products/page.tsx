"use client";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/store/slices/categoriesSlice";
import ProductCard from "@/components/Product/ProductCard";
import { useRouter, useSearchParams } from "next/navigation";

// Accordion-style category component (unchanged)
const CategoryAccordion = ({ categories, selectedIds, onSelect }) => {
  const [openCategories, setOpenCategories] = useState({});

  const toggleCategory = (id) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ul className="space-y-2">
      {categories.map((cat) => (
        <li key={cat.id} className="ml-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(cat.id)}
                onChange={() => onSelect(cat.id)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-gray-700">{cat.name}</span>
            </label>
            {cat.children && cat.children.length > 0 && (
              <button
                onClick={() => toggleCategory(cat.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                {openCategories[cat.id] ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            )}
          </div>
          <AnimatePresence>
            {cat.children && cat.children.length > 0 && openCategories[cat.id] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="ml-6"
              >
                <CategoryAccordion
                  categories={cat.children}
                  selectedIds={selectedIds}
                  onSelect={onSelect}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </li>
      ))}
    </ul>
  );
};

// Main ProductFilter component
export default function ProductFilter() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { items: categories, loading: categoriesLoading, error: categoriesError } = useSelector(
    (state) => state.categories ?? {}
  );

  const [attributes, setAttributes] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState({});
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [categorySlug, setCategorySlug] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State for mobile filter sidebar

  // Parse URL parameters and update state
  const parseUrlParams = useCallback(() => {
    const categoryIds = searchParams.getAll("category_ids[]").map((id) => parseInt(id));
    const slug = searchParams.get("category_slug") || "";
    const minPriceParam = searchParams.get("min_price") || "";
    const maxPriceParam = searchParams.get("max_price") || "";
    const sortParam = searchParams.get("sort_by") || "latest";
    const pageParam = parseInt(searchParams.get("page")) || 1;

    const attributeParams = {};
    for (const [key, value] of searchParams.entries()) {
      const match = key.match(/^attributes\[(.+)\]\[\]$/);
      if (match) {
        const attrName = match[1];
        if (!attributeParams[attrName]) {
          attributeParams[attrName] = [];
        }
        attributeParams[attrName].push(value);
      }
    }

    setSelectedCategoryIds(categoryIds);
    setCategorySlug(slug);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setSortBy(sortParam);
    setPage(pageParam);
    setSelectedAttributeValues(attributeParams);
  }, [searchParams]);

  // Handle client-side mounting and URL changes
  useEffect(() => {
    setIsClient(true);
    parseUrlParams();
  }, [parseUrlParams]);

  // Update URL when filters change
  const updateURL = useCallback(() => {
    if (!isClient) return;

    const params = new URLSearchParams();

    if (categorySlug) params.append("category_slug", categorySlug);
    selectedCategoryIds.forEach((id) => params.append("category_ids[]", id));
    if (minPrice) params.append("min_price", minPrice);
    if (maxPrice) params.append("max_price", maxPrice);
    params.append("sort_by", sortBy);
    params.append("page", page);

    Object.entries(selectedAttributeValues).forEach(([attrName, values]) => {
      values.forEach((value) => {
        params.append(`attributes[${attrName}][]`, value);
      });
    });

    const newURL = `/products?${params.toString()}`;
    router.push(newURL, { scroll: false });
  }, [isClient, categorySlug, selectedCategoryIds, minPrice, maxPrice, sortBy, page, selectedAttributeValues, router]);

  // Fetch categories if not loaded
  useEffect(() => {
    if (!categories?.length && !categoriesLoading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories?.length, categoriesLoading]);

  // Fetch attributes
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/all-attributes`);
        const data = await response.json();
        setAttributes(data);
      } catch (err) {
        toast.error("Failed to load attributes");
      }
    };
    fetchAttributes();
  }, []);

  // Fetch products based on filters
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      if (categorySlug) params.append("category_slug", categorySlug);
      selectedCategoryIds.forEach((id) => params.append("category_ids[]", id));
      params.append("sort_by", sortBy);
      params.append("page", page);

      if (minPrice) params.append("min_price", minPrice);
      if (maxPrice) params.append("max_price", maxPrice);

      Object.entries(selectedAttributeValues).forEach(([attrName, values]) => {
        values.forEach((value) => {
          params.append(`attributes[${attrName}][]`, value);
        });
      });

      const response = await fetch(`${apiBaseUrl}/products/filter?${params.toString()}`);
      const { data } = await response.json();

      let sortedProducts = [...data.data];
      if (sortBy === "price_low_to_high") {
        sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      } else if (sortBy === "price_high_to_low") {
        sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      }

      setProducts(sortedProducts);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch products when filters or URL params change
  useEffect(() => {
    if (isClient) {
      fetchProducts();
    }
  }, [isClient, selectedCategoryIds, selectedAttributeValues, sortBy, page, categorySlug, minPrice, maxPrice]);

  // Handle category selection
  const handleCategorySelect = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
    setPage(1);
  };

  // Handle attribute value selection
  const handleAttributeSelect = (attrName, value) => {
    setSelectedAttributeValues((prev) => {
      const values = prev[attrName] || [];
      const newValues = values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value];
      return { ...prev, [attrName]: newValues };
    });
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPage(newPage);
    }
  };

  // Handle category slug change
  const handleSlugChange = (e) => {
    setCategorySlug(e.target.value);
    setPage(1);
  };

  // Handle price filter changes
  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
    setPage(1);
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
    setPage(1);
  };

  // Clear price filters
  const clearPriceFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategoryIds([]);
    setSelectedAttributeValues({});
    setMinPrice("");
    setMaxPrice("");
    setCategorySlug("");
    setSortBy("latest");
    setPage(1);
    setIsFilterOpen(false); // Close filter sidebar on clear
  };

  // Toggle filter sidebar
  const toggleFilterSidebar = () => {
    setIsFilterOpen((prev) => !prev);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      selectedCategoryIds.length > 0 ||
      Object.keys(selectedAttributeValues).some((key) => selectedAttributeValues[key].length > 0) ||
      minPrice ||
      maxPrice ||
      categorySlug ||
      sortBy !== "latest"
    );
  };

  // Prevent hydration mismatch
  if (!isClient || categoriesLoading) {
    return <div className="text-center p-4">Loading categories...</div>;
  }

  if (categoriesError) {
    return <div className="text-center p-4 text-red-600">Error: {categoriesError}</div>;
  }

  return (
    <div className="relative">
      {/* Filter Button for Mobile */}
      <div className="xl:hidden p-4">
        <button
          onClick={toggleFilterSidebar}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1m-17 4h16m-16 4h16m-16 4h16" />
          </svg>
          <span>Filters</span>
          {hasActiveFilters() && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {selectedCategoryIds.length +
                Object.values(selectedAttributeValues).reduce((sum, vals) => sum + vals.length, 0) +
                (minPrice || maxPrice ? 1 : 0) +
                (categorySlug ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 p-6 mx-auto">
        {/* Filter Sidebar */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white p-6 shadow-lg z-50 xl:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={toggleFilterSidebar}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between mb-4">
                {hasActiveFilters() && (
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md font-medium transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters() && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Active Filters:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCategoryIds.length > 0 && (
                      <>
                        {selectedCategoryIds.map((categoryId) => {
                          const findCategoryName = (cats, id) => {
                            for (const cat of cats) {
                              if (cat.id === id) return cat.name;
                              if (cat.children) {
                                const found = findCategoryName(cat.children, id);
                                if (found) return found;
                              }
                            }
                            return null;
                          };
                          const categoryName = findCategoryName(categories || [], categoryId);
                          return (
                            categoryName && (
                              <span
                                key={categoryId}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {categoryName}
                              </span>
                            )
                          );
                        })}
                      </>
                    )}
                    {(minPrice || maxPrice) && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Price: ৳{minPrice || "0"} - ৳{maxPrice || "∞"}
                      </span>
                    )}
                    {Object.entries(selectedAttributeValues).map(([attrName, values]) =>
                      values.length > 0 &&
                      values.map((value) => (
                        <span
                          key={`${attrName}-${value}`}
                          className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                        >
                          {attrName}: {value}
                        </span>
                      ))
                    )}
                    {categorySlug && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                        Slug: {categorySlug}
                      </span>
                    )}
                    {sortBy !== "latest" && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        Sort: {sortBy.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-semibold">Price Range</h3>
                  {(minPrice || maxPrice) && (
                    <button
                      onClick={clearPriceFilters}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Min Price (৳)</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      placeholder="0"
                      min="0"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Max Price (৳)</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      placeholder="∞"
                      min="0"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    />
                  </div>
                </div>
                {minPrice && maxPrice && (
                  <div className="mt-2 text-xs text-gray-600">
                    Range: ৳{minPrice} - ৳{maxPrice}
                  </div>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-2">Categories</h3>
                {categories?.length > 0 ? (
                  <CategoryAccordion
                    categories={categories}
                    selectedIds={selectedCategoryIds}
                    onSelect={handleCategorySelect}
                  />
                ) : (
                  <div className="text-sm text-gray-500">No categories available</div>
                )}
              </div>

              {/* Attributes */}
              {attributes.map((attr) => (
                <div key={attr.id} className="mb-6">
                  <h3 className="text-md font-semibold mb-2">{attr.name}</h3>
                  <ul className="space-y-2">
                    {attr.values.map((val) => (
                      <li key={val.id}>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={(selectedAttributeValues[attr.name] || []).includes(val.value)}
                            onChange={() => handleAttributeSelect(attr.name, val.value)}
                            className="form-checkbox h-5 w-5 text-blue-600"
                          />
                          <span className="text-gray-700">{val.value}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay for mobile sidebar */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black xl:hidden z-40 !m-0"
              onClick={toggleFilterSidebar}
            />
          )}
        </AnimatePresence>

        {/* Desktop Filter Sidebar */}
        <div className="hidden xl:block w-full xl:w-1/5 xl:sticky top-0 xl:self-start bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Filters</h2>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md font-medium transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Active Filters:</h4>
              <div className="flex flex-wrap gap-1">
                {selectedCategoryIds.length > 0 && (
                  <>
                    {selectedCategoryIds.map((categoryId) => {
                      const findCategoryName = (cats, id) => {
                        for (const cat of cats) {
                          if (cat.id === id) return cat.name;
                          if (cat.children) {
                            const found = findCategoryName(cat.children, id);
                            if (found) return found;
                          }
                        }
                        return null;
                      };
                      const categoryName = findCategoryName(categories || [], categoryId);
                      return (
                        categoryName && (
                          <span
                            key={categoryId}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {categoryName}
                          </span>
                        )
                      );
                    })}
                  </>
                )}
                {(minPrice || maxPrice) && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    Price: ৳{minPrice || "0"} - ৳{maxPrice || "∞"}
                  </span>
                )}
                {Object.entries(selectedAttributeValues).map(([attrName, values]) =>
                  values.length > 0 &&
                  values.map((value) => (
                    <span
                      key={`${attrName}-${value}`}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                    >
                      {attrName}: {value}
                    </span>
                  ))
                )}
                {categorySlug && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                    Slug: {categorySlug}
                  </span>
                )}
                {sortBy !== "latest" && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                    Sort: {sortBy.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-semibold">Price Range</h3>
              {(minPrice || maxPrice) && (
                <button
                  onClick={clearPriceFilters}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Min Price (৳)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  placeholder="0"
                  min="0"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Max Price (৳)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  placeholder="∞"
                  min="0"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
            </div>
            {minPrice && maxPrice && (
              <div className="mt-2 text-xs text-gray-600">
                Range: ৳{minPrice} - ৳{maxPrice}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2">Categories</h3>
            {categories?.length > 0 ? (
              <CategoryAccordion
                categories={categories}
                selectedIds={selectedCategoryIds}
                onSelect={handleCategorySelect}
              />
            ) : (
              <div className="text-sm text-gray-500">No categories available</div>
            )}
          </div>

          {/* Attributes */}
          {attributes.map((attr) => (
            <div key={attr.id} className="mb-6">
              <h3 className="text-md font-semibold mb-2">{attr.name}</h3>
              <ul className="space-y-2">
                {attr.values.map((val) => (
                  <li key={val.id}>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(selectedAttributeValues[attr.name] || []).includes(val.value)}
                        onChange={() => handleAttributeSelect(attr.name, val.value)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="text-gray-700">{val.value}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Products Grid */}
        <div className="w-full xl:w-4/5">
          <div className="mb-6 px-4 py-2 flex justify-between items-center border border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {products.length} of {pagination.total} products
            </div>
            <div className="short-by">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="latest">Latest</option>
                <option value="price_low_to_high">Price: Low to High</option>
                <option value="price_high_to_low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loadingProducts ? (
            <div className="text-center p-4">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {products.map((product) => (
                  <motion.div
                    key={product?.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {products.length === 0 && !loadingProducts && (
            <div className="text-center p-8 text-gray-500">
              <p>No products found matching your filters.</p>
              <p className="text-sm mt-2">Try adjusting your search criteria.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.last_page}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}