// components/MenuItem.tsx
import Link from 'next/link';
import React from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  children: Category[];
}

interface MenuItemProps {
  category: Category;
}

const MenuItem: React.FC<MenuItemProps> = ({ category }) => {
  return (
    <li className='relative group'>
      <Link href={`/category/${category.id}`}>{category.name}</Link>
      {category.children && category.children.length > 0 && (
        <ul className="sub-menu absolute top-full left-0 w-[200px] px-4 py-2 transition-all bg-amber-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible shadow">
          {category.children.map((child) => (
            <MenuItem key={child.id} category={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
