import { HfInference } from "@huggingface/inference";
import { readFileSync } from "fs";

export async function POST(req) {
    const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

    try {
        // リクエストボディからプロンプトを取得
        const body = await req.json();
        const prompt = body.prompt || "The answer to the universe is"; // プロンプトを取得

        // Hugging Face APIを呼び出し
        const response = await hf.imageToImage({
            inputs: new Blob([readFileSync("./src/app/api/imageToImage/tanuki.png")]), // 画像を読み込む
            parameters: {
                prompt: prompt, // プロンプトを使う
                strength: 0.2, // 生成画像の強度
            },
            model: "lllyasviel/sd-controlnet-depth",
        });

        // 生成した画像データをバイナリ形式で取得
        const imageBuffer = Buffer.from(await response.arrayBuffer()); // バイナリデータを取得

        // 画像をレスポンスとして返す
        return new Response(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png', // 適切なContent-Typeを設定
            },
        });
    } catch (error) {
        console.error('Error in API:', error);  // エラーログを表示
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
