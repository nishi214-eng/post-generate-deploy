"use client";

import { useForm, SubmitHandler } from "react-hook-form"

import { useEffect,useState,useContext } from "react";
import { auth } from "@/infra/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { TextField, Button } from "@mui/material";
import { AlertContext } from "@/features/useSnackber";
import { signOut } from "firebase/auth";

import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from "next/navigation";

import "../style/login/login.css";

interface LoginForm {
  email: string
  password: string
}

export const LogInForm = () => {
    const { showAlert } = useContext(AlertContext);
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false); // ローディング状態を管理
  
    // React Hook Formの使用
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>(); // useForm関数をLoginForm型で呼び出す
  
    // ページ読み込み時にログアウトする
    useEffect(() => {
      signOut(auth);
    }, []);
  
    const onSubmit: SubmitHandler<LoginForm> = async (data) => {
      const { email, password } = data;
      setLoading(true);
  
      try {
        // サインインの実行
        await signInWithEmailAndPassword(auth, email, password);
        router.push(`/trend`);
        setLoading(false);
      } catch {
        // エラー処理
        showAlert("メールアドレスまたはパスワードが異なります。", "error");
      }
    };
  
    // パスワードの表示可否を切りかえる状態変数
    const [showPassword, setShowPassword] = useState(false);
    // パスワードの表示可否を切り替える関数
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    // ボタンを押下したときに余計な動作を防ぐ
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };
  
    return (
      <div className="form_container">
        <section className="form_wrapper">
          <div className="form_outer">
  
            <form onSubmit={handleSubmit(onSubmit)} aria-label="ログインフォーム">
              <fieldset className="input_section">
                <div className="input_subsection">
                  <label htmlFor="email" className="subsection_title">
                    メールアドレス
                  </label>
                  <div className="text_field">
                    <TextField
                      id="email"
                      fullWidth
                      variant="outlined"
                      sx={{
                        backgroundColor: "white",
                        '& .MuiInputBase-input': {
                            height: '100%',
                            padding: '10px', 
                            border: '0px', 
                        },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2', // フォーカス時のボーダー色
                        },
                      }}
                      {...register("email", {
                        required: "メールアドレスは必須です",
                        pattern: {
                          value: /^.+@.+\..+/,
                          message: "正しいメールアドレスを入力してください",
                        },
                      })}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  </div>
                </div>
  
                <div className="input_subsection">
                  <label htmlFor="password" className="subsection_title">
                    パスワード
                  </label>
                  <div className="text_field">
                  <TextField
                    id="password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                      variant="outlined"
                      sx={{
                        backgroundColor: "white",
                        '& .MuiInputBase-input': {
                            height: '100%',
                            padding: '10px', 
                        },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2', // フォーカス時のボーダー色
                        },
                        '& .MuiFormHelperText-root': { // ここを修正
                            margin: '0px', // マージンを0に設定
                        },
                    }}
                    {...register("password", {
                        required: "パスワードは必須です",
                        minLength: {
                        value: 6,
                        message: "パスワードは6文字以上で入力してください",
                        },
                        maxLength: {
                        value: 12,
                        message: "パスワードは12文字以内で入力してください",
                        },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}                
                    />

                  </div>
                </div>
              </fieldset>
  
              <div className="button_field">
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    width: "100%",
                    borderRadius: "1%",
                    boxShadow: "none",
                  }}
                >
                  {loading ? "処理中..." : "ログイン"}
                </Button>
              </div>
            </form>
            
          </div>
        </section>
      </div>
    );
  };
  