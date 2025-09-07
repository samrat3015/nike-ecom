import PageContent from './PageContent';

export default async function Page({ params }: { params: { slug: string } }) {
  // Validate params before using them
  const { slug } = params;
  
  return (
    <div className="container mx-auto py-10">
      <PageContent slug={slug} />
    </div>
  );
}
