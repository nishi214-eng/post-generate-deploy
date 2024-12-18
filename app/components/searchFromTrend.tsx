"use client";

import { TextField, Button, CardMedia, SelectChangeEvent } from "@mui/material";
import { useState } from "react";
import { savedItemData } from "@/types/itemData";
import { db } from "@/infra/firebase";
import { getDocs, collection, orderBy, query } from "firebase/firestore";
import { generateText } from "@/features/generateText";
import { useRouter } from "next/navigation";
import { SearchTrend } from "./searchTrend";
import * as React from 'react';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useEffect,useContext } from "react";
import "../style/search/search.css"
import { AlertContext } from "@/features/useSnackber";
import { ChangeSelect } from "./changePrompt";
import { createEmbedding } from "@/features/createEmbedding";
import Modal from "./modal";

export const SearchFromTrend = () => {
    const { showAlert } = useContext(AlertContext);
    const [trend, setTrend] = useState<string>("和歌山市立博物館");
    const [itemState, setItemState] = useState<savedItemData[]>([]); // firestoreから呼び出したアイテムデータを管理するステート
    const [results, setResults] = useState<number[]>([]); // 結果を保存するためのステート
    const [loading, setLoading] = useState<boolean>(false); // ローディング状態を管理
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [content, setContent] = useState<string>("");

    const handleSubmit = async () => {
        setLoading(true); // ローディング開始
        // 検索クエリをベクトル化
        const vectorTrend = await createEmbedding(trend);
        // firestoreのベクトルデータを全件呼び出して配列に格納
        const itemData: savedItemData[] = [];
        const vectorList: number[][] = [];
        const q = query(collection(db, "item"), orderBy("date")); // itemコレクションへの参照を作成（日付順)
        const querySnapshot = await getDocs(q); // ドキュメントデータを全件取得
        querySnapshot.forEach((doc) => {
            itemData.push(doc.data() as savedItemData);
        });
        setItemState(itemData);
        itemData.forEach((item) => {
            vectorList.push(item.vectorEmbedding as [])
        });
        try {
            // POSTリクエストを送信
            const response = await fetch("/api/faiss", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ queryvector: vectorTrend, vectorDataSet: vectorList }), // ベクトルをリクエストボディに含める
            });

            if (!response.ok) {
                const errorText = await response.text(); // エラーレスポンスのテキストを取得
                throw new Error(`Network response was not ok: ${response.status}, ${errorText}`);
            }

            const data = await response.json(); // レスポンスを JSON として解析
            setResults(data); // 結果をステートに保存

            // 検索結果のセクションまでスクロールする
            const element = document.getElementById('search-result');
            if(element){
                element.scrollIntoView({  
                    behavior: 'smooth'  
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false); // ローディング終了
        }
    };

    // 検索したアイテムを選択→アイテムのデータを渡してページ遷移する関数
    const selectItem = async (selectItem: savedItemData) => {
        let systemPrompt = `あなたはSNSマーケティングのプロです。\nまた、後述するのは${selectItem.itemName}についての解説です。${selectItem.explanation}`;
        let userPrompt =
        `X(旧Twitter)で、和歌山市立博物館の収蔵品を宣伝する140字以内の宣伝ポストを作成してください。\n
        ##目的##\n
        和歌山市立博物館の客数増加を目的とします。\n
        ##出力形式##\n
        宣伝文のみを出力してください。また、文頭に#${trend}をつけてください。\n
        ##宣伝文の仕様##\n
        宣伝ポスト作成にあたり、世間の話題に即した広報を行う「リアルタイムマーケティング」を用います。\n
        今世間で話題となっている"${trend}"と、和歌山市立博物館の収蔵品"${selectItem.itemName}"を関連付けた文章を作成し、読者の興味を引いてください。\n
        また、${trend}と${selectItem.itemName}の関連性がわかりやすいように、"${technique}"を用いてください
        また、${tone}のように振舞ってください。\n
        ##入力##\n
        世間の話題：${trend}\n
        宣伝する収蔵品：${selectItem.itemName}`
        let textResult: string[] = [];
        // 3回生成してresult配列に格納
        for (let i = 0; i < 4; i++) {
            let gereratedText = await generateText(systemPrompt, userPrompt);
            if (gereratedText) {
                textResult.push(gereratedText);
            }
        }
        let enTexts: string[] = [];
        systemPrompt = `あなたはプロの翻訳家です。入力する日本語の文章を英語に変換してください`;
        for(let j = 0; j < textResult.length; j++){
            userPrompt =
            `入力として与える博物館の宣伝文を250文字以内で英語に翻訳してください\n
            ##目的\n
            和歌山市立博物館の客数増加を目的としtwitterに投稿します。\n
            ## 出力形式\n
            英語分のみを出力してください。\n
            ##入力\n
            ${textResult[j]}
            `
            let gereratedText = await generateText(systemPrompt, userPrompt);
            if (gereratedText) {
                enTexts.push(gereratedText);
            }
        }
        postTest(textResult,enTexts);
        setLoading(false); // ローディング終了

    }
    {/* また、${trend}と${selectItem.itemName}の関連性がわかりやすいように、「${selectItem.itemName}が～なので、まるで${trend}のよう」といった比喩表現を利用してください。"${selectItem.itemName}"は"${trend}"と似通った特徴を持つ収蔵品です。 */ }

    // ラジオボタンの入力を保存するステート
    const [selectedItem, setSelectedItem] = useState<number | null>(null);

    const handleSelectItem = async() => {
        setLoading(true); // ローディング開始
        if (selectedItem !== null) {
            let systemPrompt = `博識な博物館学芸員です。また、後述するのは和歌山市立博物館が所有する収蔵品の、${itemState[selectedItem].itemName}についての解説です。${itemState[selectedItem].explanation}`;
            let userPrompt =
            `ある「トピック」と、「博物館の収蔵品」に関連性があるかどうかを、「低、中、高」判定し、その理由を示してください。\n
            ##入力##\n
            収蔵品：${itemState[selectedItem].itemName}\n
            トピック：${trend}
            ##出力の例##\n
            関連性：低(ここでhtmlの改行タグ)\n
            ${itemState[selectedItem].itemName}と${trend}は、~という理由で関連性が低いです。
            ##関連性の例##\n
            関連性がない→トピックが「月」で、収蔵品が「蟻の絵」といったように、二者を連想することができないもの\n
            関連性がある→トピックが「コブラ」で、収蔵品が「蛇の絵」といったように二者を連想できるもの。
            `
            let gereratedText = await generateText(systemPrompt, userPrompt);
            if(gereratedText){
                setContent(gereratedText)
                setIsOpenModal(true);
            }
            setLoading(false);
        }else{
            showAlert(`収蔵品を選択してください`, "error");
            setLoading(false);
        }
    };

    // 生成した文書を渡してページ遷移
    const router = useRouter();
    const postTest = (jpTexts: string[],enTexts: string[],) => {
        const queryParams = new URLSearchParams();
        // urlに追加
        jpTexts.forEach((value) => queryParams.append('jpTexts', value));
        enTexts.forEach((value) => queryParams.append('enTexts', value));
        router.push(`/post?${queryParams.toString()}`);
    }
    
    const [tone, setTone] = React.useState(''); // トーンの状態管理
    const [technique, setTechnique] = React.useState(''); // 技法の状態管理

    // トーン変更時のハンドラ
    const handleToneChange = (event: SelectChangeEvent) => {
        setTone(event.target.value); // トーンの値を更新
    };

    // 技法変更時のハンドラ
    const handleTechniqueChange = (event: SelectChangeEvent) => {
        setTechnique(event.target.value); // 技法の値を更新
    };

    // トーンの選択肢
    const toneOptions = [
        { value: '子供', label: '子供' },
        { value: '学者', label: '学者' },
        { value: 'ビジネス風', label: 'ビジネス風' },
        { value: '友達', label: '友達' },
        { value: '感情的/情熱的な人', label: '感情的/情熱的な人' },
        { value: 'インフルエンサー', label: 'インフルエンサー' },
    ];

    // 技法の選択肢
    const techniqueOptions = [
        { value: '比喩表現', label: '比喩表現' },
        { value: '反復法', label: '反復法' },
        { value: '省略法', label: '省略法' },
        { value: '倒置法', label: '倒置法' },
        { value: '呼びかけ', label: '呼びかけ' },
        { value: '対句法', label: '対句法' },
    ];

    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const handleTopicSelect = (topic: string) => {
        setSelectedTopic(topic);
    };
    useEffect(() => {
        setIsClient(true);
        if (selectedTopic !== null) {
            console.log(selectedTopic);
            setTrend(selectedTopic);
        }
    }, [selectedTopic]);
    
    const [isClient, setIsClient] = useState(false); // クライアントサイドであるかどうか
    useEffect(() => {
        // クライアントサイドでのみ実行されるようにする
        setIsClient(true);
    }, []);
    const handleConfirm = () => {
        if(selectedItem){
            selectItem(itemState[selectedItem])
        }
    };


    // クライアントサイドでのみSelectをレンダリング
    if (!isClient) return null;
    return (
        <div style={{ display: 'flex',height:"100vh" }}>
            <section id="search-trend-form" style={{ flex: 0.5, padding: '5px', display: 'flex', flexDirection: 'column' }}>
             <SearchTrend 
                onTopicSelect={handleTopicSelect} 
             />
            </section>

            <section id="search-form" style={{ flex: 1, padding: '10px',width:"75%",paddingLeft:"10%",paddingRight:"10%" }}>
                <div className="section-hedder">
                    <div className="section-title">
                        <h2>収蔵品を検索</h2>
                    </div>
                    <div className="section-explanation">
                        <p>トレンドトピックを入力し、収蔵品を検索してください</p>
                    </div>
                </div>
                <TextField 
                    className="textField"
                    value={trend}
                    onChange={(event) => setTrend(event.target.value)} 
                    required
                    id="search-input"
                    label="トレンドトピック"
                    sx={{
                        width:"100%",
                        marginBottom:"10px"
                    }}
                />
                
                <Button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    variant="contained"
                    type="submit"
                    sx={{
                        width:"100%",
                        borderRadius: "50px",
                    }}
                >
                    {loading ? "検索中" : "収蔵品を検索"}
                </Button>
                <section id="search-result">
                {results.length > 0 && (
                    <div>
                        <div className="section-hedder">
                            <div className="section-title">
                                <h2>検索結果</h2>
                            </div>
                            <div className="section-explanation">
                                <p>{trend}に関連性が高い収蔵品10件です。1つを選択し、ポストを生成してください</p>
                            </div>
                        </div>
                        <ul> {/* 複数行に折り返し可能に */}
                        {results && results.map((result: number, index) => (
                               <li key={index}> {/* liタグにkeyを追加 */}
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                name="item"
                                                value={result}
                                                checked={selectedItem === result}
                                                onChange={() => setSelectedItem(result)} // 選択されたラジオボタンのインデックスを更新
                                                className="radio"
                                            />
                                            <React.Fragment>
                                                <CardContent
                                                    sx={{
                                                        // 選択されたカードにスタイルを適用
                                                        opacity: selectedItem === result ? 0.3 : 1,
                                                        transition: 'opacity 0.3s ease-in-out',
                                                        maxWidth: "100%",                                                    }}
                                                >
                                                    <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                                                        {itemState[result].author}
                                                    </Typography>
                                                    {itemState[result].storagePath && (
                                                        <CardMedia
                                                            component="img"
                                                            height="194"
                                                            image={`https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com/o/${encodeURIComponent(itemState[result].storagePath)}?alt=media`}
                                                            alt={itemState[result].itemName}
                                                        />
                                                    )}
                                                    <Typography variant="h5" component="div">
                                                        {itemState[result].itemName}
                                                    </Typography>
                                                    <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
                                                        {itemState[result].era}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {itemState[result].explanation}
                                                    </Typography>
                                                </CardContent>
                                            </React.Fragment>
                                        </label>
                                    </div>
                                </li>
                        ))}
                        </ul>
                        <div>
                            <h2>口調と表現技法の選択</h2>
                            {/* ChangeSelectコンポーネントを呼び出す */}
                            <ChangeSelect
                                title="口調" // ラベルのタイトル
                                options={toneOptions} // トーンの選択肢
                                value={tone} // 現在のトーンの値
                                onChange={handleToneChange} // トーン変更時のハンドラ
                            />
                            <ChangeSelect
                                title="表現技法" // ラベルのタイトル
                                options={techniqueOptions} // 技法の選択肢
                                value={technique} // 現在の技法の値
                                onChange={handleTechniqueChange} // 技法変更時のハンドラ
                            />
                        </div>

                        <Button 
                            onClick={handleSelectItem} 
                            disabled={loading}
                            variant="contained"
                            type="submit"
                            sx={{
                                width:"100%",
                                borderRadius: "50px",
                                marginBottom:"15vh"
                            }}
                        >
                            {loading ? "処理中" : "次へ"}
                        </Button>
                    </div>
                )}
                </section>

                <div>
                  <Modal isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal} content={content} onConfirm={handleConfirm}/>
                </div>
            </section>
            {/*
            <div>
                <button onClick={handleGenerateImage}>Generate Image</button>
                {imageSrc && <img src={imageSrc} alt="Generated" />}
            </div>
            */}
        </div>
    );
};
