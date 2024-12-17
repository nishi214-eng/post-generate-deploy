import type { Metadata } from 'next'
import { AlertProvider } from './features/useSnackber';
import { AuthProvider } from './stores/authContext';
export const metadata: Metadata = {
  title: '広報ポスト自動生成システム',
  description: '和歌山市立博物館広報ポスト自動生成システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AlertProvider>
            <div id="root">{children}</div>
          </AlertProvider>
        </AuthProvider>
      </body>
    </html>
  )
}