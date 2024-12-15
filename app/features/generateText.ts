import OpenAI from "openai";

export const generateText = async(systemPrompt:string,userPrompt:string) =>{
    // openAIへの参照を作成
    const openai = new OpenAI({ 
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser:true 
    });

    // プロンプトからテキストを生成
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: userPrompt,
            },
        ],
    });

    return completion.choices[0].message.content;
}