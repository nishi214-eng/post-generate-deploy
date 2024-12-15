"use client";

import { useContext, useState } from "react";
import { FileInput } from "./fileInput";
import { Button,Box } from "@mui/material";
import { itemData } from "../types/itemData";
import ExcelJS from "exceljs";
import { uploadItemDateToFirestore } from "../infra/database";
import { AlertContext } from "../features/useSnackber";

export const AutoInputItemForm = () => {
    const { showAlert } = useContext(AlertContext);
    const [file, setFile] = useState<File | null>(null); // 入力ファイルのstate

    const handleSubmit = async () => { // 入力されたExcelファイルを読み込み、1行ずつfirestoreにアップロード
        if (file) {
            const excelData = await file.arrayBuffer(); // Array Buffer(jsでバイナリデータを扱う為の形式）にxlsxを変換
            const workbookImg = new ExcelJS.Workbook(); // 画像データを読み込むためにexcel jsライブラリでworkbookを作成
            await workbookImg.xlsx.load(excelData); // Excelデータを作成したworkBookにロード
            let imgSheet = workbookImg.worksheets[0]; // シートの読み込み
            let images = imgSheet.getImages(); // シート内の画像情報を取得

            let result: { 
                item: string;       // 収蔵品名の型を指定
                author: string|null;     // 作者の型を指定
                era: string|null;        // 時代の型を指定
                explanation: string; // 解説文の型を指定
                file: File|null;         // fileの型を指定
            }[] = [];
            // 1行目から末尾まで走査
            for (let i = 0; i < imgSheet.rowCount - 1; i++) {
                result[i] = { item: "", era: null, author: null, explanation: "", file: null }; // 初期化

                // 各行のデータを取得
                result[i].item = String(imgSheet.getCell(`A${i + 2}`).value);

                // 空の場合nullを代入
                const authorCellValue = imgSheet.getCell(`B${i + 2}`).value;
                result[i].author = authorCellValue ? String(authorCellValue) : null;

                const eraCellValue = imgSheet.getCell(`C${i + 2}`).value;
                result[i].era = eraCellValue ? String(eraCellValue) : null;

                result[i].explanation = String(imgSheet.getCell(`D${i + 2}`).value);

                
                // 特定のセルに関連する画像をフィルタリング
                const targetCell = 'E' + String(i + 2); // 画像があると考えられるセル(E2開始)
                const cell = imgSheet.getCell(targetCell); // セルの情報を取得
                const rowIndex = Number(cell.row); // セルの行位置
                const colIndex = Number(cell.col); // セルの列位置

                // 取得したい画像を含むセルの位置情報でimagesをフィルタリング
                const relatedImages = images.filter(image => {
                    // 画像の範囲情報を取得
                    const { range } = image;
                    return range.tl.col === colIndex - 1 && range.tl.row === rowIndex - 1; // ExcelJSは0始まりのインデックス
                });

                let imageData = workbookImg.getImage(Number(relatedImages[0]?.imageId)); // 特定したセルのimage idから画像を取得
                // 画像データをStorageに送信できる形式に処理
                if (imageData && imageData.buffer) {
                    const blob = new Blob([imageData.buffer], { type: 'image/png' }); // Blobに変換
                    const file = new File([blob], `preItemFile`, { type: 'image/png' }); // Fileに変換
                    result[i].file = file;   // JSONオブジェクトをresult配列に追加
                    console.log(result);
                } else {
                    result[i].file = null;
                }
            }

            Promise.all(result.map(item => {
                return uploadItemDateToFirestore(
                    item.item,
                    item.era,
                    item.author,
                    item.explanation,
                    item.file
                )
            })).then(
                () => { showAlert("アップロードが完了しました", "success"); }
            ).catch((error) => {
                throw new Error(error);
            });
        }
    }

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', // 縦並びにする
                gap: 2, // フィールド間の隙間
                width: '100%', // 幅を100%に設定
            }}
        >
            <FileInput setFile={setFile} fileFormat=".xlsx" str="Excelファイル" />
            
            <Button
                id="submit"
                onClick={handleSubmit}
                variant="contained"
                sx={{ width: '100%' }} // ボタンも横幅100%
            >
                送信
            </Button>
        </Box>
    );
}
