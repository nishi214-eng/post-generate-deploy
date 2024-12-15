import { db } from "./firebase"
import { doc,Timestamp } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import { fileUploadToStorage } from "../features/fileUploadToStorage";
import { generateText } from "../features/generateText";
import { createEmbedding } from "@/features/createEmbedding";
import { getLlmLingua } from "@/features/llmLingua";

export const uploadItemDateToFirestore = async (
    itemName:string,
    era:string|null,
    author:string|null,
    explanation:string,
    file:File|null
) => {
    // 入力から余分な空白を削除
    itemName = itemName.trim();
    if(era){
        era = era.trim();
    }
    if(author){
        author = author.trim();
    }
    explanation = explanation.trim();

    // itemDataコレクションへの参照を作成
    let date = Timestamp.now();
    let arrangeDate = date.toDate(); // 時刻を取得
    // 送信時の日付を定義
    let formattedDate = arrangeDate.getFullYear()+ "y" + (arrangeDate.getMonth()+1) + "m" + arrangeDate.getDate() + "d" + arrangeDate.getHours() + "h" + arrangeDate.getMinutes() + "m" + arrangeDate.getSeconds() + "s";
    let documentName = itemName + "_" + formattedDate;
    let fileName = itemName + "_" + formattedDate;
    const itemDataRef = doc(db, "item",documentName);
    if(file){
        try{
            // 日本語の解説文をgpt4で英文に変換
            let systemPrompt = `あなたはプロの翻訳家です。入力する日本語の文章を英語に変換してください`;
            let userPrompt =`入力として与える解説文を英語に翻訳してください\n## 出力形式\n英語分のみを出力してください。\n##入力\n${explanation}`
            const enExplanation = await generateText(systemPrompt, userPrompt)||"";
            // 英語の解説文をllmLinguaで圧縮
            const compressedPrompt = await getLlmLingua(enExplanation);
            // 解説文を意味ベクトルに変換
            const vectorEmbedding = await createEmbedding(compressedPrompt);
            // storageに画像を送信
            const storagePath = await fileUploadToStorage(file,fileName);
            try{
                await setDoc(itemDataRef, {
                    itemName,
                    era,
                    author,
                    explanation,
                    enExplanation,
                    storagePath,
                    compressedPrompt,
                    vectorEmbedding,
                    date
                });
            }catch(error){
                throw new Error('firestoreへのデータ送信に失敗');
            }
        }catch (error){
            throw new Error('storageへのアップロードに失敗');
        }
    }else{
        try{
            // 日本語の解説文をgpt4で英文に変換
            let systemPrompt = `あなたはプロの翻訳家です。入力する日本語の文章を英語に変換してください`;
            let userPrompt =`入力として与える解説文を英語に翻訳してください\n## 出力形式\n英語分のみを出力してください。\n##入力\n${explanation}`
            const enExplanation = await generateText(systemPrompt, userPrompt)||"";
            // 英語の解説文をllmLinguaで圧縮
            const compressedPrompt = await getLlmLingua(enExplanation);
            // 解説文を意味ベクトルに変換
            const vectorEmbedding = await createEmbedding(compressedPrompt);            
            await setDoc(itemDataRef, {
                itemName,
                era,
                author,
                explanation,
                enExplanation,
                compressedPrompt,
                vectorEmbedding,
                date

                
            });
        }catch(error){
            throw new Error('firestoreへのデータ送信に失敗');
        }
    }
}