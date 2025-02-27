import React, { useState,useEffect } from 'react';
import { Button, Tabs, Tab, Box, CardContent, Typography, TextField } from '@mui/material';
import "../style/post/post.css";

export type postToTwitter = {
    jpTexts: string[];
    enTexts: string[];
    imageUrls: string[]; // 画像URLのプロパティを追加
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export const PostToTweet: React.FC<postToTwitter> = ({ jpTexts, enTexts, imageUrls }) => {
    const [selectedPost, setSelectedPost] = useState<string>('');
    const [editedText, setEditedText] = useState<string>('');
    const [value, setValue] = useState<number>(0);
    const [isClient, setIsClient] = useState(false);  // クライアントサイドかどうかの状態

    useEffect(() => {
        setIsClient(true);  // クライアントサイドでのみ実行される
    }, []);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedText(event.target.value);
    };

    if (!isClient) {
        return null; // サーバーサイドレンダリング時は何も表示しない
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="texts-wrapper">
                    <Tab label="日本語" />
                    <Tab label="英語" />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <section id="post">
                    <div className="section-header">
                        <div className="section-title">
                            <h2>文章を選択</h2>
                        </div>
                        <div className="section-explanation">
                            <p>生成された文章の中からポストする文章を選択してください</p>
                        </div>
                    </div>
                    <ul>
                        {jpTexts && jpTexts.map((result: string, index) => (
                            <li key={index}>
                                <label>
                                    <input
                                        type="radio"
                                        name="item"
                                        value={result}
                                        className="radio"
                                        onChange={() => {
                                            setSelectedPost(result);
                                            setEditedText(result);
                                        }}
                                    />
                                    <CardContent
                                        sx={{
                                            maxWidth: '100%',
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: selectedPost === result ? 'bold' : 'normal', // 選択されたテキストを太字に
                                            }}
                                        >
                                            {selectedPost === result ? (
                                               <TextField
                                                    variant="standard"
                                                    fullWidth
                                                    multiline
                                                    value={editedText}
                                                    onChange={handleTextChange}
                                                    sx={{
                                                        backgroundColor: 'white',
                                                        borderRadius: '8px',
                                                        fontWeight: 'bold',  // 文字を太字に
                                                    }}
                                                    InputProps={{
                                                        disableUnderline: true,  // 下線を非表示
                                                        sx: {
                                                            fontWeight: 'bold',  // Input内の文字を太字に
                                                        },
                                                    }}
                                                />
                                            ) : (
                                                result
                                            )}
                                        </Typography>                     
                                    </CardContent>
                                </label>
                            </li>
                        ))}
                    </ul>
                    {imageUrls && imageUrls[0] !== 'undefined' && (
                         <div style={{ marginTop: '20px' }}>
                            <div className="section-explanation" >
                                <p>画像つきの投稿をする場合は<br/>
                                1. 下記の画像を右クリックしてコピーしてください<br/>
                                2.「ポスト」のボタンを押したあとに遷移する、X（旧twitter）の画面で右クリックして貼り付けてください
                                </p>
                            </div>
                            
                            <img src={`https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com/o/${encodeURIComponent(imageUrls[0])}?alt=media`}/>
                        </div>
                        )
                    }
                    <Button
                        variant="contained"
                        color="primary"
                        component="a"
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(editedText)}`}
                        target="_blank"
                        type="submit"
                        sx={{ width: '100%', borderRadius: '50px' }}
                    >
                        ポスト
                    </Button>
                </section>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <section id="post">
                    <div className="section-header">
                        <div className="section-title">
                            <h2>文章を選択</h2>
                        </div>
                        <div className="section-explanation">
                            <p>生成された文章の中からポストする文章を選択してください</p>
                        </div>
                    </div>
                    <ul>
                        {enTexts && enTexts.map((result: string, index) => (
                            <li key={index}>
                                <label>
                                    <input
                                        type="radio"
                                        name="item"
                                        value={result}
                                        className="radio"
                                        onChange={() => {
                                            setSelectedPost(result);
                                            setEditedText(result);
                                        }}
                                    />
                                    <CardContent
                                        sx={{
                                            maxWidth: '100%',
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: selectedPost === result ? 'bold' : 'normal', // 選択されたテキストを太字に
                                            }}
                                        >
                                            {selectedPost === result ? (
                                                <TextField
                                                    variant="standard"
                                                    fullWidth
                                                    multiline
                                                    value={editedText}
                                                    onChange={handleTextChange}
                                                    sx={{
                                                        backgroundColor: 'white',
                                                        borderRadius: '8px',
                                                        fontWeight: 'bold',  // 文字を太字に
                                                    }}
                                                    InputProps={{
                                                        disableUnderline: true,  // 下線を非表示
                                                        sx: {
                                                            fontWeight: 'bold',  // Input内の文字を太字に
                                                        },
                                                    }}
                                                />
                                            ) : (
                                                result
                                            )}
                                        </Typography>
                                    </CardContent>
                                </label>
                            </li>
                        ))}
                    </ul>
                    {imageUrls[0] && (
                        <div>
                            <div className="section-explanation">
                                <p>画像つきの投稿をする場合は、下記の画像をコピーし、「ポスト」のボタンを押したあとに遷移する、X（旧twitter）の画面で貼り付けてください</p>
                            </div>
                            <img src={`https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com/o/${encodeURIComponent(imageUrls[0])}?alt=media`}/>
                        </div>
                        )
                    }
                    <Button
                        variant="contained"
                        color="primary"
                        component="a"
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(editedText)}`}
                        target="_blank"
                        type="submit"
                        sx={{ width: '100%', borderRadius: '50px' }}
                    >
                        ポスト
                    </Button>
                </section>
            </CustomTabPanel>
        </Box>
    );
};
