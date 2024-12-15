"use client";

import { useSearchParams } from 'next/navigation';
import { PostToTweet } from '@/components/postToTwetter';
import { Suspense } from 'react';

function PageContent() {
  const searchParams = useSearchParams();
  const jpTexts: string[] = searchParams.getAll('jpTexts');
  const enTexts: string[] = searchParams.getAll('enTexts');

  return <PostToTweet jpTexts={jpTexts} enTexts={enTexts} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
