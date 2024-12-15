"use client";

import styled from "@emotion/styled";
import { Button } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

// ファイル入力のコンポーネント
export const FileInput: React.FC<{
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    fileFormat: string,
    str: string  // strをstring型として指定
}> = ({ setFile, fileFormat, str }) => {
    return (
        <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUpload />}
        >
            {str}  {/* strはボタンに表示されるテキスト */}
            <VisuallyHiddenInput
                type="file"
                accept={fileFormat}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const files = event.currentTarget.files;
                    if (!files || files?.length === 0) return;
                    const file = files[0];
                    setFile(file);
                }}
                multiple
            />
        </Button>
    );
};
