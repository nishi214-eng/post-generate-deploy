"use client";

import { useSearchParams } from 'next/navigation';
import { PostToTweet } from '@/components/postToTwetter';

export default function Page() {
  const searchParams = useSearchParams()
  const jpTexts:string[] = searchParams.getAll('jpTexts')
  const enTexts:string[] = searchParams.getAll('enTexts')
  return (
    <div>
        <PostToTweet jpTexts={jpTexts} enTexts={enTexts}/>
    </div>
  )
}