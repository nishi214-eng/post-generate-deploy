// コサイン類似度を計算する関数
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    // 内積を計算
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    
    // ベクトルAとBのノルムを計算
    const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    
    // コサイン類似度を返す
    return dotProduct / (normA * normB);
};

// 類似ベクトルを検索する関数
export const searchFromEmbedding = async (queryvector: number[], vectorDataSet: number[][]) => {
    // クエリベクトルと各ベクトルとのコサイン類似度を計算
    const similarities = vectorDataSet.map((vector, index) => {
        return {
            index: index,
            similarity: cosineSimilarity(queryvector, vector)
        };
    });

    // 類似度でソート（高い順）
    similarities.sort((a, b) => b.similarity - a.similarity);

    // 上位5つのラベルを取得（インデックスで示される）
    const resultsVal = similarities.slice(0, 5).map(item => item.index);

    return resultsVal;
};
