import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';

export async function GET() {
    try {
        // 本日の日付を取得
        const today = new Date();

        // 本日の1日前を設定
        today.setDate(today.getDate() - 1);

        const results = await googleTrends.dailyTrends({
            trendDate: today,
            geo: 'JP',
        });
        
        // 結果をパース（JSON文字列 -> オブジェクト）
        const parsedResults = JSON.parse(results);

        // 上位25件の検索語を取得
        const trendingSearches = parsedResults.default.trendingSearchesDays[0].trendingSearches;
        // 上位25件の検索語を返す
        const trendingSearchesData = trendingSearches.map((search, index) => ({
            rank: index + 1,   // ランク付け（1〜25）
            query: search.title.query, // 検索語が空の場合は '不明' を表示
            traffic: search.formattedTraffic || '不明',  // 検索量が空の場合は '不明' を表示
        }));

        // 正常なレスポンスを返す
        return NextResponse.json({ trendingSearches: trendingSearchesData });
    } catch (error: any) {
        console.error('Error fetching Google Trends data:', error);

        // エラー時のレスポンス
        return NextResponse.json(
            { error: 'Failed to fetch trends data', details: error.message },
            { status: 500 }
        );
    }
}
