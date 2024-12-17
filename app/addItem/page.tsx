"use client";

import React, { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import { ManualInputItemForm } from "@/components/ManualInputItemForm";
import { AutoInputItemForm } from "@/components/AutoInputItemForm";
import { Header } from "@/components/header";
import { useAuthContext } from "@/stores/authContext";
import { useRouter } from "next/navigation";

function CustomTabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
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

export default function Page() {
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const { user } = useAuthContext(); // 追加: 認証状態を取得
    const router = useRouter();

    if (user === undefined) {
        return <></>; // ユーザー情報を取得中
    }

    if (user === null) {
        router.push('/'); 
        return <></>; // ログインしていない場合
    }

    return (
        <div>
            <Header />
            <Box sx={{ width: "100%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={value} onChange={handleChange} aria-label="input-method-tabs">
                        <Tab label="手動で入力" />
                        <Tab label="Excelから読み込み" />
                    </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <ManualInputItemForm />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <AutoInputItemForm />
                </CustomTabPanel>
            </Box>
        </div>
    );
}
