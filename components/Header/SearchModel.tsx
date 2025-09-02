import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../Product/ProductCard";
import { useRouter } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const SearchModel = ({ logo, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState([]);
  const [recentSearchTerms, setRecentSearchTerms] = useState([]);
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);

  const router = useRouter();

  // Load recent search terms from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Load recent search terms from localStorage
    const savedRecentTerms = localStorage.getItem('recentSearchTerms');
    if (savedRecentTerms) {
      try {
        setRecentSearchTerms(JSON.parse(savedRecentTerms));
      } catch (error) {
        console.error('Error parsing recent search terms:', error);
      }
    }
    
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Save recent search terms to localStorage
  const saveSearchTerm = (term) => {
    if (!term.trim()) return;
    
    const updatedTerms = [term, ...recentSearchTerms.filter(t => t !== term)].slice(0, 8); // Keep max 8 recent terms
    setRecentSearchTerms(updatedTerms);
    localStorage.setItem('recentSearchTerms', JSON.stringify(updatedTerms));
  };

  // Debounced search effect
  useEffect(() => {
    if (searchQuery) {
      debounceTimeout.current = setTimeout(async () => {
        try {
          const response = await fetch(`${apiBaseUrl}/products/filter?search=${searchQuery}`);
          const data = await response.json();
          if (data.status === "success") {
            setProducts(data.data.data);
            // Save search term when results are found
            if (data.data.data.length > 0) {
              saveSearchTerm(searchQuery);
            }
          }
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      }, 500); // 500ms delay
    } else {
      setProducts([]);
    }
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery, apiBaseUrl]);

  const handleProductClick = (product) => {
    //console.log("Product clicked:", product.name); // Debug log
    onClose(); // Hide the search model
  };

  const handleRecentTermClick = (term) => {
    setSearchQuery(term);
  };

  const clearRecentSearches = () => {
    setRecentSearchTerms([]);
    localStorage.removeItem('recentSearchTerms');
  };

  // Handle logo click to close modal
  const handleLogoClick = (e) => {
    e.preventDefault();
    onClose();
    router.push('/');
  };

  // Handle overlay click to close modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      y: -50,
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      y: -50,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const productGridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const productItemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }
  };

  return (
    <AnimatePresence>
      {isMounted && (
        <>
          {/* Overlay with blur effect */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md"
            onClick={handleOverlayClick}
          />
          
          {/* Search Modal */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            className="header_search_model_area shadow fixed top-0 left-0 w-full min-h-[30vh] z-50 bg-white/95 backdrop-blur-sm"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                {/* Logo */}
                <motion.div 
                  className="search_header"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="logo hidden sm:block">
                    <div onClick={handleLogoClick} className="cursor-pointer">
                      <img src={logo} alt="Nike" className="w-32" />
                    </div>
                  </div>
                </motion.div>

                {/* Search Input */}
                <motion.div 
                  className="search_input_area flex-1 max-w-3xl mx-8"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full border-none outline-none focus:bg-gray-200 transition-colors text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </motion.div>

                {/* Cancel Button */}
                <motion.button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>

              {/* Recent Search Terms */}
              {!searchQuery && recentSearchTerms.length > 0 && (
                <motion.div 
                  className="px-6 py-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-500 text-sm font-medium">Recent Searches</h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {recentSearchTerms.map((term, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleRecentTermClick(term)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 text-sm font-medium transition-colors"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {term}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

 

              {/* Search Results Area */}
              <AnimatePresence mode="wait">
                {searchQuery && products.length > 0 && (
                  <motion.div 
                    className="px-6 py-6 border-t border-gray-200 max-h-[50vh] overflow-y-scroll"
                    variants={productGridVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <motion.div 
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                      variants={productGridVariants}
                    >
                      {products.map((product, index) => (
                        <motion.div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="cursor-pointer"
                          variants={productItemVariants}
                          whileHover={{ 
                            scale: 1.02,
                            transition: { duration: 0.2 }
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No Results */}
              {searchQuery && products.length === 0 && (
                <motion.div 
                  className="px-6 py-4 border-t border-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-gray-600 text-sm">No results for "{searchQuery}"...</div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModel;