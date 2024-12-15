'use client';

import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { useEffect, useState } from 'react';
import Select from '@mui/material/Select';
import { SelectChangeEvent } from '@mui/material/Select';

// Optionの型を定義
interface Option {
  value: string;
  label: string;
}

// プロパティの型を定義
interface ChangeSelectProps {
  title: string;
  options: Option[]; // 配列型の定義
  value: string; // 文字列型の定義
  onChange: (event: SelectChangeEvent) => void; // イベントハンドラの型定義
}

// ChangeSelectコンポーネントの定義
export const ChangeSelect: React.FC<ChangeSelectProps> = ({ title, options, value, onChange }) => {
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのみレンダリング
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // クライアントサイドでなければ何も表示しない

  return (
    <div>
      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id={`${title}-label`}>{title}</InputLabel>
        <Select
          labelId={`${title}-label`}
          id={`${title}-select`}
          label={title}
          value={value}
          onChange={onChange}
        >
          <MenuItem value="">
            <em>選択してください</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
