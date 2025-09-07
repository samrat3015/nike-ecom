import PageContent from './PageContent';
import { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Page - ${params.slug}`,
  };
}

export default function Page({ params }: PageProps) {
  return (
    <div className="container mx-auto py-10">
      <PageContent slug={params.slug} />
    </div>
  );
}