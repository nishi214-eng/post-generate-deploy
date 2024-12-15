import OpenAI from "openai";

export const createEmbedding = async(text:string) => {
    // openAIへの参照を作成
    const openai = new OpenAI({ 
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser:true 
    });

    //textからembeddingへの変換
    try{
        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-large",
            input: text,
        });
        return embedding.data[0].embedding;
    }catch(error){
        console.log(error)
        throw new Error(String(error));
    }
}
