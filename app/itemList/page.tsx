"use client";

import { ItemList } from "@/components/itemList";
import { Header } from "@/components/header";
import { useAuthContext } from "@/stores/authContext";
import { useRouter } from "next/navigation";
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
    <div>
      <Header />
      <ItemList />
    </div>
  );
}
