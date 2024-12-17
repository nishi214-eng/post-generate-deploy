import React, { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";

interface ModalProps {
    isOpenModal: boolean;
    setIsOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
    content: string; // 親から渡す文字列
    onConfirm: () => void; // コールバック関数を追加
}

export default function Modal({ isOpenModal, setIsOpenModal, content, onConfirm }: ModalProps) {
    const [loading, setLoading] = useState(false); // ローディング状態の追加
    const modalRef = useRef(null);

    // ---------------------------------------------
    // モーダル外をクリックした時の処理
    // ---------------------------------------------
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !(modalRef.current as HTMLElement).contains(event.target as Node)) {
                setIsOpenModal(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modalRef, setIsOpenModal]);

    // ---------------------------------------------
    // モーダル表示中: 背面のスクロールを禁止
    // ---------------------------------------------
    useEffect(() => {
        if (isOpenModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [isOpenModal]);

    return (
        <>
            <style>
                {`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5); /* 背景の半透明 */
                    z-index: 10;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .modal-content {
                    background-color: #f8f9fa; /* モーダルの背景色 */
                    border-radius: 8px; /* 角丸 */
                    padding: 20px;
                    max-width: 90%;
                    max-height: 90%;
                    overflow-y: auto;
                }
                `}
            </style>
            {isOpenModal && (
                <div className="modal-overlay">
                    <div className="modal-content" ref={modalRef}>
                        {/* content内のHTMLタグを解釈して表示 */}
                        <p dangerouslySetInnerHTML={{ __html: content }} />

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "10px",
                                marginTop: "20px",
                            }}
                        >
                            {/* 戻るボタン */}
                            <Button
                                onClick={() => {
                                    setIsOpenModal(false);
                                }}
                                variant="contained"
                                sx={{
                                    flex: "1",
                                    borderRadius: "50px",
                                    backgroundColor: "gray",
                                    color: "white",
                                    "&:hover": { backgroundColor: "#5a5a5a" },
                                    "&:active": { backgroundColor: "#444" },
                                    boxShadow: "none",
                                }}
                            >
                                戻る
                            </Button>

                            {/* ポストを生成するボタン */}
                            <Button
                                onClick={() => {
                                    setLoading(true); // ローディング状態を開始
                                    onConfirm(); // 親コンポーネントに通知
                                    setTimeout(() => {
                                        setIsOpenModal(false); // モーダルを閉じる
                                        setLoading(false); // ローディング終了
                                    }, 4000); // 4秒遅延
                                }}
                                variant="contained"
                                disabled={loading} // ローディング中は無効化
                                sx={{
                                    flex: "1",
                                    borderRadius: "50px",
                                }}
                            >
                                {loading ? "生成中..." : "ポストを生成する"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
