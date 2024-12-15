import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';

// 遅延を設定する関数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface Trend {
    keyword: string; // 対象のキーワード
    isThresholdExceeded: boolean; // 閾値を超えたかどうか
}

// リトライ機能を持つ関数
const fetchWithRetry = async (keyword: string, retries: number = 5): Promise<any> => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const threshold = 65; // 閾値

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            // Google Trends APIへのリクエスト
            const results = await googleTrends.interestOverTime({
                keyword: keyword, // 各キーワードでリクエスト
                startTime: oneYearAgo,
                endTime: today,
                geo: 'JP', // 地域（例: 日本）
            });

            // 結果を処理
            const parsedResults = JSON.parse(results);
            const timelineData = parsedResults?.default?.timelineData;

            if (!timelineData || timelineData.length === 0) {
                throw new Error(`No timeline data for keyword: ${keyword}`);
            }

            // 最後のエントリを取得
            const lastEntry = timelineData[timelineData.length - 1];

            // 検索数を取得
            const currentWeekSearchCount = parseInt(lastEntry.value[0], 10);

            // 本日を含む週の検索数が閾値を超えているか判定
            const isThresholdExceeded = currentWeekSearchCount >= threshold;

            // 結果を返す
            return {
                keyword, // 対象のキーワード
                isThresholdExceeded,
            };
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed for keyword: ${keyword}`, error);

            // 最後のリトライでない場合は待機して再試行
            if (attempt < retries - 1) {
                await delay(5000); // 5秒待機
            } else {
                throw new Error(`Failed to fetch data for keyword: ${keyword} after ${retries} attempts`);
            }
        }
    }
};

export async function GET(req: Request) {
    try {
        // リクエストからクエリパラメータを取得
        const url = new URL(req.url);
        const keywordsParam = url.searchParams.get('keywords'); // 'keywords' パラメータを取得

        if (!keywordsParam) {
            // キーワードが指定されていない場合はエラーを返す
            return NextResponse.json(
                { error: 'Keywords parameter is required' },
                { status: 400 }
            );
        }

        // キーワードはカンマ区切りで複数ある場合を想定して分割
        const keywords = keywordsParam.split(',');

        // 複数キーワードのトレンドデータを順番に取得
        const trends: Trend[] = [];
        for (const keyword of keywords) {
            console.log(`Fetching data for keyword: ${keyword}`);

            try {
                // リトライを伴うデータ取得
                const trendData = await fetchWithRetry(keyword);

                // 結果を保存
                trends.push(trendData);
            } catch (error) {
                // 最大再試行回数を超えた場合、エラーメッセージを出力
                console.error(`Final failure for keyword: ${keyword}`, error);
            }
        }

        // 結果をレスポンスとして返す
        return NextResponse.json({ trends });

    } catch (error) {
        console.error('Error fetching Google Trends data:', error);

        // エラー時のレスポンス
        return NextResponse.json(
            { error: 'Failed to fetch trends data' },
            { status: 500 }
        );
    }
}
