export const getTrendKeywords = async (keywords: string[]) => {
    try {
        // FastAPIにPOSTリクエストを送信
        const response = await fetch(process.env.NEXT_PUBLIC_FASTAPI_URL + "fetch_trends"!, {  // !で環境変数が確実に存在することを宣言
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keywords }),  // 渡されたキーワードリストをJSONとして送信
        });
    
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // トレンドワードのみをフィルタリング
        return data.trends.map((trend: { keyword: string; isThresholdExceeded: boolean }) => trend.keyword);
        
    } catch (error) {
        console.error('Error:', error);
    }
};
