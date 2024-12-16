"use client";

import { Button,TextField,Box } from "@mui/material"
import { useState,useContext } from "react"
import { uploadItemDateToFirestore } from "../infra/database";
import { FileInput } from "./fileInput";
import { AlertContext } from "../features/useSnackber";

export const ManualInputItemForm = () => {
    const {showAlert} = useContext(AlertContext);
    const [itemName,setItemName] = useState<string>(""); // 収蔵品の名前のstate
    const [era,setEra] = useState<string>(""); // 時代名のstate
    const [author,setAuthor] = useState<string>(""); // キーワードのstate
    const [explanation,setExplanation] = useState<string>(""); // 解説文のstate
    const [file, setFile] = useState<File | null>(null); // 入力ファイルのstate

    // 受け取った文字列の先頭と末尾の空白を削除する関数
    const trimWord = (str:string) => {
        return str.trim(); // メモ:replaceよりもtrimメソッドを用いた方が可読性が向上する
    };
    // 入力に問題がないかチェックし、入力をFirestoreに送信する関数
    const handleSubmit = async() => {
        // 各状態変数の先頭と末尾の空白を削除
        let trimItemName = trimWord(itemName);
        let trimEra = trimWord(era);
        let trimAuthor = trimWord(author);
        let trimExplanation = trimWord(explanation);
        // 各変数のうちいずれかが空白なら処理を中断
        if (!trimItemName || !trimExplanation){
            throw new Error("空白の要素があります");
        }
        // 送信処理
        try{
            await uploadItemDateToFirestore(trimItemName,trimEra,trimAuthor,trimExplanation,file)
            showAlert("アップロードに成功しました","success")
        }catch(error){
            showAlert("アップロードに失敗しました","error")
        }
    }


    return(
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', // 縦並びにする
                gap: 2, // フィールド間の隙間
                width: '100%', // 幅を100%に設定
            }}
        >
            <TextField 
                id="itemName" 
                label="収蔵品の名前" 
                variant="outlined" 
                fullWidth // 横幅100%
                onChange={(event) => setItemName(event.target.value)}
            />
            <TextField 
                id="era" 
                label="時代" 
                variant="outlined"
                fullWidth // 横幅100%
                onChange={(event) => setEra(event.target.value)}
            />
            <TextField 
                id="author" 
                label="作者・著者" 
                variant="outlined" 
                fullWidth // 横幅100%
                onChange={(event) => setAuthor(event.target.value)}
            />
            <TextField 
                id="explanation" 
                label="解説文" 
                variant="outlined" 
                fullWidth // 横幅100%
                multiline
                rows={6}
                onChange={(event) => setExplanation(event.target.value)}
            />
            {/* ファイル入力のコンポーネント（仮） */}
            <FileInput setFile={setFile} fileFormat="image/*" str="収蔵品の画像ファイル"/>
            
            <Button
                id="submit"
                onClick={handleSubmit}
                variant="contained"
                sx={{ width: '100%' }} // ボタンも横幅100%
            >
                送信
            </Button>
        </Box>
    )
}