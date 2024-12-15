"use client";

import React, { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import { ManualInputItemForm } from "@/components/ManualInputItemForm";
import { AutoInputItemForm } from "@/components/AutoInputItemForm";
import { Header } from "@/components/header";

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
