// app/pages/[slug]/page.js
import React from "react";

// Example: Fetch data from API
async function getPage(slug) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/page/${slug}`, {
    cache: "no-store" // or "force-cache" if data is static
  });
  if (!res.ok) throw new Error("Failed to fetch page");
  return res.json();
}

export default async function Page({ params }) {
  const page = await getPage(params.slug);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl mb-5 font-bold">{page?.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page?.content }} />
    </div>
  );
}
