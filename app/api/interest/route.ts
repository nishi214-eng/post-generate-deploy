import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';

// 遅延を設定する関数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// トレンド情報取得関数（リトライ機能付き）
const fetchWithRetry = async (keyword: string, retries: number = 5): Promise<any> => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const threshold = 65; // 閾値

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const results = await googleTrends.interestOverTime({
                keyword: keyword,
                startTime: oneYearAgo,
                endTime: today,
                geo: 'JP', // 日本を指定
            });

            const parsedResults = JSON.parse(results);
            const timelineData = parsedResults?.default?.timelineData;

            if (!timelineData || timelineData.length === 0) {
                throw new Error(`No timeline data for keyword: ${keyword}`);
            }

            const lastEntry = timelineData[timelineData.length - 1];
            const currentWeekSearchCount = parseInt(lastEntry.value[0], 10);
            const isThresholdExceeded = currentWeekSearchCount >= threshold;

            return { keyword, isThresholdExceeded };
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed for keyword: ${keyword}`, error);
            if (attempt < retries - 1) {
                await delay(5000);
            } else {
                throw new Error(`Failed to fetch data for keyword: ${keyword} after ${retries} attempts`);
            }
        }
    }
};

// POSTメソッドのエントリポイント
export async function POST(req: Request) {
    try {
        // リクエストボディからJSONデータを取得
        const { keywords } = await req.json();

        if (!keywords || !Array.isArray(keywords)) {
            return NextResponse.json(
                { error: 'Invalid request: keywords must be an array' },
                { status: 400 }
            );
        }

        const trends = [];
        for (const keyword of keywords) {
            console.log(`Fetching data for keyword: ${keyword}`);
            try {
                const trendData = await fetchWithRetry(keyword);
                trends.push(trendData);
            } catch (error) {
                console.error(`Final failure for keyword: ${keyword}`, error);
            }
        }

        return NextResponse.json({ trends });
    } catch (error) {
        console.error('Error processing POST request:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
