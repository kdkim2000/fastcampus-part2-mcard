import { useState } from 'react'
import seedFromMock from '@/scripts/seed-from-mock'
import Flex from '@/components/shared/Flex'
import Spacing from '@/components/shared/Spacing'
import styled from '@emotion/styled'
import { colors } from '@/styles/colorPalette'

function TestPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  const handleSeedDatabase = async () => {
    const confirmed = window.confirm(
      'Mock 데이터로 Firebase를 초기화하시겠습니까?\n\n' +
        '- 카드: 10개\n' +
        '- 광고 배너: 2개\n\n' +
        '기존 데이터는 유지되며, 동일한 ID는 덮어쓰기됩니다.',
    )

    if (!confirmed) return

    setLoading(true)
    setMessage('⏳ 데이터 업로드 중...')
    setLogs([])

    // Console.log를 캡처하여 UI에 표시
    const originalLog = console.log
    console.log = (...args: any[]) => {
      originalLog(...args)
      setLogs((prev) => [...prev, args.join(' ')])
    }

    try {
      await seedFromMock()
      setMessage('✅ Firebase 초기화 완료!')
    } catch (error) {
      setMessage('❌ 초기화 실패: ' + (error as Error).message)
      console.error(error)
    } finally {
      setLoading(false)
      console.log = originalLog // 원래대로 복원
    }
  }

  return (
    <Container>
      <Flex direction="column" align="center">
        <Title>🔧 Firebase 관리자 페이지</Title>
        <Spacing size={30} />

        <Button onClick={handleSeedDatabase} disabled={loading}>
          {loading ? '⏳ 처리 중...' : '📦 Mock 데이터로 초기화'}
        </Button>

        <Spacing size={20} />

        {message && (
          <MessageBox success={message.includes('✅')}>
            <MessageText>{message}</MessageText>
          </MessageBox>
        )}

        {logs.length > 0 && (
          <>
            <Spacing size={20} />
            <LogBox>
              <LogTitle>📋 실행 로그</LogTitle>
              {logs.map((log, index) => (
                <LogItem key={index}>{log}</LogItem>
              ))}
            </LogBox>
          </>
        )}

        <Spacing size={40} />

        <InfoBox>
          <InfoTitle>📋 초기화되는 데이터</InfoTitle>
          <InfoList>
            <li>
              <strong>카드 (CARD):</strong> 10개
              <ul>
                <li>KB국민 My WE:SH 카드</li>
                <li>다담카드</li>
                <li>청춘대로 톡톡카드</li>
                <li>Easy all 티타늄카드</li>
                <li>그 외 6개 카드</li>
              </ul>
            </li>
            <li>
              <strong>광고 배너 (ADBANNER):</strong> 2개
            </li>
          </InfoList>

          <Spacing size={20} />

          <InfoTitle>⚠️ 주의사항</InfoTitle>
          <InfoList>
            <li>기존 데이터는 유지되며, 새로운 데이터가 추가됩니다</li>
            <li>
              동일한 문서 ID가 있으면 덮어쓰기됩니다 (card-001 ~ card-010)
            </li>
            <li>프로덕션 환경에서는 신중하게 사용하세요</li>
            <li>초기화 후 홈페이지를 새로고침하여 확인하세요</li>
          </InfoList>
        </InfoBox>
      </Flex>
    </Container>
  )
}

// 스타일 컴포넌트
const Container = styled.div`
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
`

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: ${colors.black};
  text-align: center;
`

const Button = styled.button<{ disabled?: boolean }>`
  min-width: 250px;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background: ${({ disabled }) => (disabled ? colors.grey : colors.blue)};
  border: none;
  border-radius: 12px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`

const MessageBox = styled.div<{ success: boolean }>`
  padding: 20px 30px;
  background: ${({ success }) => (success ? '#e8f5e9' : '#ffebee')};
  border: 2px solid ${({ success }) => (success ? '#4caf50' : '#f44336')};
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
`

const MessageText = styled.p`
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin: 0;
`

const LogBox = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 12px;
  max-height: 300px;
  overflow-y: auto;
`

const LogTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
`

const LogItem = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 13px;
  padding: 4px 0;
  color: #333;
  white-space: pre-wrap;
`

const InfoBox = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 30px;
  background: #f9f9f9;
  border-radius: 12px;
  text-align: left;
`

const InfoTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: ${colors.black};
`

const InfoList = styled.ul`
  list-style: none;
  padding: 0;

  li {
    margin-bottom: 12px;
    padding-left: 20px;
    position: relative;
    line-height: 1.6;

    &:before {
      content: '•';
      position: absolute;
      left: 0;
      color: ${colors.blue};
      font-weight: bold;
    }

    ul {
      margin-top: 8px;
      padding-left: 20px;

      li {
        font-size: 14px;
        color: #666;
        margin-bottom: 4px;
      }
    }
  }

  strong {
    color: ${colors.black};
    font-weight: 600;
  }
`

export default TestPage
