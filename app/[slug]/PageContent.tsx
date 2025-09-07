'use client';

import React from 'react';

interface PageData {
  title: string;
  content: string;
}

async function getPage(slug: string): Promise<PageData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/page/${slug}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
  return res.json();
}

const PageContent = ({ slug }: { slug: string }) => {
  const [page, setPage] = React.useState<PageData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getPage(slug)
      .then(setPage)
      .catch(err => setError(err.message));
  }, [slug]);

  if (error) {
    return (
      <>
        <h1 className="text-3xl mb-5 font-bold text-red-600">Error</h1>
        <p>Failed to load page: {error}</p>
      </>
    );
  }

  if (!page) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1 className="text-3xl mb-5 font-bold">{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </>
  );
};

export default PageContent;
