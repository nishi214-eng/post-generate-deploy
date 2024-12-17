'use client'; 

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
  } from 'react'
  import type { User } from '@firebase/auth'
  import { onAuthStateChanged } from '@firebase/auth'
  import { auth } from '../infra/firebase'

  export type GlobalAuthState = {
    user: User | null | undefined
  }

  // コンテキストの初期値
  const initialState: GlobalAuthState = {
    user: undefined,
  }

  // コンテキストの作成
  const AuthContext = createContext<GlobalAuthState>(initialState)
  
  type Props = { children: ReactNode }
  export const AuthProvider = ({ children }: Props) => {
    // userオブジェクトを格納するstate
    const [user, setUser] = useState<GlobalAuthState>(initialState);
    
    // コンポーネントがマウントされると実行
    useEffect(() => {
      try {
        // ログインしているユーザーの情報をuserに格納
        return onAuthStateChanged(auth, (user) => {
          setUser({
            user,
          })
        })
      } catch (error) {
        setUser(initialState)
        throw error
      }
    }, [])
  
    return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
  }
  
  export const useAuthContext = () => useContext(AuthContext)
  