import React from "react";

// Define the shape of the page data returned by the API
interface PageData {
  title: string;
  content: string;
}

// Fetch data from API
async function getPage(slug: string): Promise<PageData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/page/${slug}`, {
    cache: "no-store", // Fetch fresh data on every request
  });
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
  return res.json();
}

// Define the props type for the Page component
interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: PageProps) {
  try {
    const page = await getPage(params.slug);

    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl mb-5 font-bold">{page.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl mb-5 font-bold text-red-600">Error</h1>
        <p>Failed to load page: {(error as Error).message}</p>
      </div>
    );
  }
}