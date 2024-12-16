export const getLlmLingua = async(prompt:string) =>{
    try {
        // fastAPIにpostリクエストを送信
        const response = await fetch(process.env.NEXT_PUBLIC_FASTAPI_URL+"compress"!, { // !で環境変数が確実に存在することを宣言
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });
    
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        return data.compressed_prompt.compressed_prompt;
    } catch (error) {
        console.error('Error:', error);
    }    
}