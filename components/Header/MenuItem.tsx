// components/MenuItem.tsx
import Link from "next/link";
import React from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
  children: Category[];
}

interface MenuItemProps {
  category: Category;
}


  // Function to collect all category IDs from a category and its children
const getAllCategoryIds = (category) => {
  let ids = [];

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
const generateCategoryUrl = (category) => {
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


const MenuItem: React.FC<MenuItemProps> = ({ category }) => {
  return (
    <>
      <li className="relative group">
        <Link href={generateCategoryUrl(category)}>{category.name}</Link>
        {category.children && category.children.length > 0 && (
          <ul className="sub-menu absolute top-full left-0 w-[200px] px-4 py-2 transition-all bg-amber-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible shadow">
            {category.children.map((child) => (
              <MenuItem key={child.id} category={child} />
            ))}
          </ul>
        )}
      </li>
    </>
  );
};

export default MenuItem;
