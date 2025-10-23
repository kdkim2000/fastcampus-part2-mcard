import { useEffect, useState } from 'react'
import { useSetRecoilState } from 'recoil'

import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@remote/firebase'
import { userAtom } from '@atoms/user'

// 인증처리
function AuthGuard({ children }: { children: React.ReactNode }) {
  const [initialize, setInitialize] = useState(false)
  const setUser = useSetRecoilState(userAtom)

  useEffect(() => {
    // Firebase 인증 상태 변경 감지
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user != null) {
        setUser({
          uid: user.uid,
          email: user.email ?? '',
          displayName: user.displayName ?? '',
          photoURL: user.photoURL ?? '',
        })
      } else {
        setUser(null)
      }

      setInitialize(true)
    })

    // cleanup 함수: 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribe()
    }
  }, [setUser])

  // 초기화 전에는 아무것도 렌더링하지 않음
  if (initialize === false) {
    return null
  }

  return <>{children}</>
}

export default AuthGuard
