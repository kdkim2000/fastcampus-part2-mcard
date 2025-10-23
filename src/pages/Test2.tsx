import { useState } from 'react'
import seedDatabase from '@/scripts/seed-database'
import Flex from '@/components/shared/Flex'
import Button from '@/components/shared/Button'
import Spacing from '@/components/shared/Spacing'

function TestPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSeedDatabase = async () => {
    if (!window.confirm('데이터베이스를 초기화하시겠습니까?')) {
      return
    }

    setLoading(true)
    setMessage('데이터 생성 중...')

    try {
      await seedDatabase()
      setMessage('✅ 데이터베이스 초기화 완료!')
    } catch (error) {
      setMessage('❌ 초기화 실패: ' + (error as Error).message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px' }}>
      <Flex direction="column" align="center">
        <h1>🔧 관리자 페이지</h1>
        <Spacing size={20} />

        <Button
          onClick={handleSeedDatabase}
          disabled={loading}
          style={{ minWidth: '200px' }}
        >
          {loading ? '처리 중...' : '데이터베이스 초기화'}
        </Button>

        <Spacing size={20} />

        {message && (
          <div
            style={{
              padding: '20px',
              backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee',
              borderRadius: '8px',
              maxWidth: '500px',
              textAlign: 'center',
            }}
          >
            {message}
          </div>
        )}

        <Spacing size={40} />

        <div style={{ textAlign: 'left', maxWidth: '600px' }}>
          <h3>📋 초기화되는 데이터:</h3>
          <ul>
            <li>카드 (CARD): 15개</li>
            <li>광고 배너 (ADBANNER): 3개</li>
          </ul>
          <br />
          <h3>⚠️ 주의사항:</h3>
          <ul>
            <li>기존 데이터는 유지되며, 새로운 데이터가 추가됩니다</li>
            <li>중복된 ID가 있으면 덮어쓰기됩니다</li>
            <li>프로덕션 환경에서는 신중하게 사용하세요</li>
          </ul>
        </div>
      </Flex>
    </div>
  )
}

export default TestPage
