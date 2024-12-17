'use client';

import { useEffect, useState } from 'react';
import { generateText } from '@/features/generateText';
import { Button } from '@mui/material';
import { getTrendKeywords } from '@/features/getAiTrend';
interface Trend {
    keyword: string; // 対象のキーワード
    isThresholdExceeded: boolean; // 閾値を超えたかどうか
}
interface SearchTrendProps {
    onTopicSelect: (topic: string) => void;
}

export const SearchTrend: React.FC<SearchTrendProps> = ({onTopicSelect }) => {
    const [trendingSearches, setTrendingSearches] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [ailoading, setAiloading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [trends, setTrends] = useState<string[]>([]);  
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const fetchTrend = async () => {
        try {
            setLoading(true);
            const url = `/api/trend`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setTrendingSearches(data.trendingSearches);  // データをセット
                setLoading(false);
            }
        }catch(e){
            console.log(e);
        }
    }
    const fetchTrendingSearches = async () => {
        try {
            setAiloading(true);
            const today = new Date().toISOString().split('T')[0]; // 日付フォーマットを簡潔化
            let systemPrompt = `あなたは博識で、与えられた情報を元に関連する祝日やイベント、出来事を羅列することが得意です。`;

            let userPrompt = 
                `${today}の祝日や祭日、記念日、イベント、出来事、花鳥風月に関するワードを5個挙げてください。\n
                ##目的\n
                ${today}の日本の祝日やイベント、その日に会った出来事、をリスト化し、ツイートに投稿することを目的としています。\n
                ##出力形式\n
                5個のワードを \nの改行付きで出力してください。前置きなどは不要です\n
                また、クリスマスなどの特定の日時が存在する記念日は、${today}におこるものでなければ絶対に出力しないでください。これは絶対です。\n
                また、「クリスマス準備期間」などの冗長なものはできるだけひかえてください。\n
                ##出力例\n
                建国記念日\n
                ノーベル賞授賞式\n
                三億円事件\n
                七夕\n
                ##禁止事項\n
                (伝統週間)のように、括弧などを用いて補足を加えるのは絶対にやめてください。\n
            `;
            // テキスト生成のリクエスト
            const gereratedText1 = await generateText(systemPrompt, userPrompt);
            systemPrompt = `あなたは博識で、花鳥風月に関する事柄を羅列することが得意です。`;

            userPrompt = 
                `${today}の花鳥風月に関するワードを10個挙げてください。\n
                ##目的\n
                ${today}の花鳥風月に関するワードをリスト化し、ツイートに投稿することを目的としています。\n
                ##出力形式\n
                5個のワードを \nの改行付きで出力してください。前置きなどは不要です\n
                また、クリスマスなどの特定の日時が存在する記念日は、${today}におこるものでなければ絶対に出力しないでください。これは絶対です。\n
                また、「クリスマス準備期間」などの冗長なものはできるだけひかえてください。\n
                ##出力例\n
                椿\n
                鶯\n
                七夕\n
                ##禁止事項\n
                (伝統週間)のように、括弧などを用いて補足を加えるのは絶対にやめてください。\n
            `;
            // テキスト生成のリクエスト
            const gereratedText2 = await generateText(systemPrompt, userPrompt);
            if (gereratedText1 && gereratedText2) {
                // 生成されたテキストを改行で分割して配列に格納
                const topicsArray1 = gereratedText1
                    .split('\n')            // 改行で分割
                    .map(topic => topic.trim()) // 前後の空白を削除
                    .filter(topic => topic !== ''); // 空要素を除外
                
                const topicsArray2 = gereratedText2
                    .split('\n')            // 改行で分割
                    .map(topic => topic.trim()) // 前後の空白を削除
                    .filter(topic => topic !== ''); // 空要素を除外

                // 配列を結合
                const topicsArray = [...topicsArray1, ...topicsArray2];
                
                // 配列をカンマ区切りの文字列に変換
                const response = await getTrendKeywords(topicsArray);  // ここで getTrendKeywords を呼び出します

                // responseがnullまたはundefinedでないことを確認
                if (response && response.length > 0) {
                    // トレンドデータが存在する場合、trendsデータを状態に設定
                    setTrends(response);  // getTrendKeywordsから返されたトレンドキーワードを設定
                    setAiloading(false);
                } else {
                    // エラーや空の結果の場合
                    setError('No trending keywords found or an error occurred.');
                }
            }
        } catch (error) {
            console.error('Error during fetchTrendingSearches:', error);
        }
    };

    if (error) {
        return <div>{error}</div>;
    }
    const handleSelectTopic = (topic: string) => {
        setSelectedTopic(topic);
        onTopicSelect(topic); // 親コンポーネントに選択されたトピックを渡す
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 急上昇中のトレンド */}
            <Button 
                disabled={loading}
                onClick={fetchTrend} 
                sx={{marginTop:"20px"}}
            >
                {loading ? "検索中" : "急上昇中のトピック"}
            </Button>
            {trendingSearches.length > 0 && (
                <div style={{ padding:"5px",paddingTop:"0" }}>
                    <table>
                        <tbody>
                            {trendingSearches.map((search) => (
                                <tr
                                    key={search.query}
                                    onClick={() => handleSelectTopic(search.query)}
                                    style={{
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor = "#f0f8ff")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            selectedTopic === search ? "#add8e6" : "transparent")
                                    }
                                >
                                    <td>{search.query}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* AIが算出したトピック */}
            <Button onClick={fetchTrendingSearches} disabled={ailoading}>
                {ailoading ? "検索中" : "AIが算出したトピック"}
            </Button>
            {trends && trends.length > 0 && (
                <div style={{ padding:"5px",paddingTop:"0" }}>
                    <table>
                        <tbody>
                            {trends
                                .map((trend, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => handleSelectTopic(trend)}
                                        style={{
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor = "#f0f8ff")
                                        }
                                        onMouseLeave={(e) => {
                                            {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                            }
                                        }}                           
                                    >
                                        <td>{trend}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

    );
}