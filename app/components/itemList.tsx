import { Button, Box, CardContent, Typography, CardMedia } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { getDocs, collection, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '@/infra/firebase';
import { savedItemData } from '@/types/itemData';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export const ItemList = () => {
    const [items, setItems] = useState<savedItemData[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState<any>(null); // 最後のドキュメントを保持
    const [hasNextPage, setHasNextPage] = useState(true); // 次のページがあるかどうかを管理
    const [loadingNext, setLoadingNext] = useState(false); // 次のデータを読み込み中かどうか

    // 最初の8件を取得する関数
    const fetchItems = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "items"),
                orderBy("date", "desc"), // 降順（新しいものが先）
                limit(8) // 最新の8件を取得
            );
            const querySnapshot = await getDocs(q);

            const newItems: savedItemData[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as savedItemData;
                newItems.push(data);
            });

            setItems(newItems);
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // 最後のドキュメントを更新
            setHasNextPage(querySnapshot.docs.length === 8); // 次のページがあるかを判定
        } catch (error) {
            console.error('Error fetching items: ', error);
        } finally {
            setLoading(false);
        }
    };

    // 次の8件を取得する関数
    const fetchNextItems = async () => {
        if (!lastVisible || !hasNextPage) return; // 最後のドキュメントがなければ次を取得しない
    
        setLoadingNext(true);
        try {
            const q = query(
                collection(db, "items"),
                orderBy("date", "desc"),
                startAfter(lastVisible), // ここが重要！前回の最後のドキュメントの次から取得する
                limit(8)
            );
    
            const querySnapshot = await getDocs(q);
            const newItems: savedItemData[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as savedItemData;
                newItems.push(data);
            });
    
            setItems((prevItems) => [...prevItems, ...newItems]); // 既存データに追加
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // 最後のドキュメントを更新
    
            // 次のページがあるかを判定
            setHasNextPage(querySnapshot.docs.length === 8);
        } catch (error) {
            console.error('Error fetching next items: ', error);
        } finally {
            setLoadingNext(false);
        }
    };
    

    useEffect(() => {
        fetchItems(); // 初回ロードで最初の8件を取得
    }, []);

    if (loading) {
        return <></>;
    }

    return (
        <section id="itemList">
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'space-between',
                    marginBottom: '10%',
                    padding: 0,
                    width: '80%',
                    marginLeft: '10%',
                    marginTop: '5%',
                }}
            >
                {items.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            listStyle: 'none',
                            width: {
                                xs: 'calc(100% - 10px)',
                                sm: 'calc(50% - 10px)',
                            },
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#fff',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'scale(1.02)',
                            },
                        }}
                    >
                        <CardContent
                            sx={{
                                maxWidth: '100%',
                                transition: 'opacity 0.3s ease-in-out',
                            }}
                        >
                            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                                {item.author}
                            </Typography>
                            {item.storagePath && (
                                <CardMedia
                                    component="img"
                                    height="194"
                                    image={`https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com/o/${encodeURIComponent(item.storagePath)}?alt=media`}
                                    alt={item.itemName}
                                />
                            )}
                            <Typography variant="h5" component="div">
                                {item.itemName}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
                                {item.era}
                            </Typography>
                            <Typography variant="body2">{item.explanation}</Typography>
                        </CardContent>
                    </Box>
                ))}
            </Box>
            <Box sx={{ textAlign: 'right', marginTop: '0px' }}>
                {/* 前のページボタンを削除 */}
                <Button
                    onClick={fetchNextItems}
                    disabled={loadingNext || !hasNextPage} // 次のデータを取得中または次のページがない場合は無効化
                    sx={{
                        marginLeft: '10px',
                        backgroundColor: 'transparent', // 背景色をなくす
                        border: 'none', // 枠線を消す
                        padding: 0, // 余白を消す
                        '&:hover': {
                            backgroundColor: 'transparent', // ホバー時も背景色を変更しない
                        },
                        transform: 'rotate(180deg)', // アイコンを180度回転
                    }}
                >
                    <ArrowBackIosIcon />
                </Button>
            </Box>
        </section>
    );
};
