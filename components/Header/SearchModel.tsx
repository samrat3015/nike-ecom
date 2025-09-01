import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";

const SearchModel = ({ logo, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    // Focus after hydration to avoid hydration mismatch
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const popularSearchTerms = [
    "on court styles",
    "road racing", 
    "air jordan 1",
    "sneakers men",
    "air force 1",
    "shoes",
    "jordan",
    "running shoes"
  ];

  return (
    
    <div className="header_search_model_area fixed top-0 left-0 w-full min-h-[30vh] z-50 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        {/* Logo */}
        <div className="search_header">
          <div className="logo">
            <Link href="/">
              <img src={logo || "/api/placeholder/60/24"} alt="Nike" className="w-32" />
            </Link>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="search_input_area flex-1 max-w-3xl mx-8">
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
        </div>

        {/* Cancel Button */}
        <button 
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>

      {/* Popular Search Terms */}
      <div className="px-6 py-8">
        <h3 className="text-gray-500 text-sm font-medium mb-6">Popular Search Terms</h3>
        <div className="flex flex-wrap gap-3">
          {popularSearchTerms.map((term, index) => (
            <button
              key={index}
              onClick={() => setSearchQuery(term)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 text-sm font-medium transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Area (when there's a query) */}
      {searchQuery && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="text-gray-600 text-sm">
            Searching for "{searchQuery}"...
          </div>
          {/* You can add actual search results here */}
        </div>
      )}
    </div>
  );
};

export default SearchModel;