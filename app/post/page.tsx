"use client";

import { useSearchParams } from 'next/navigation';
import { PostToTweet } from '@/components/postToTwetter';
import { Suspense } from 'react';
import { useAuthContext } from '@/stores/authContext';
import { useRouter } from "next/navigation";

function PageContent() {
  const searchParams = useSearchParams();
  const jpTexts: string[] = searchParams.getAll("jpTexts");
  const enTexts: string[] = searchParams.getAll("enTexts");
  const imageUrls: string[] = searchParams.getAll("imageUrls"); // 画像URLも取得

  return <PostToTweet jpTexts={jpTexts} enTexts={enTexts} imageUrls={imageUrls} />;
}

export default function Page() {
  const { user } = useAuthContext(); // 追加: 認証状態を取得
  const router = useRouter();

  if (user === undefined) {
    return <></>; // ユーザー情報を取得中
  }

  if (user === null) {
    router.push('/'); 
    return <></>; // ログインしていない場合
  }

  return (
    <Suspense fallback={<></>}>
      <PageContent />
    </Suspense>
  );
}
