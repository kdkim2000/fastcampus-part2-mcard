import { collection, writeBatch, doc } from 'firebase/firestore'
import { store } from '@/remote/firebase'
import { COLLECTIONS } from '@/constants'
import { Card, AdBanner } from '@/models/card'

// ============================================
// 카드 샘플 데이터
// ============================================
const SAMPLE_CARDS: Card[] = [
  {
    name: '신한 Deep Dream 카드',
    corpName: '신한카드',
    tags: ['쇼핑', '주유', '통신'],
    benefit: [
      '편의점 5% 할인',
      '주요 쇼핑몰 10% 할인',
      '주유 리터당 100원 할인',
      '통신요금 5% 청구할인',
    ],
    promotion: {
      title: '신규 가입 혜택',
      terms:
        '신규 가입 후 3개월 내 30만원 이상 이용 시 스타벅스 아메리카노 쿠폰 5매 증정',
    },
    payback: '연회비 대비 최대 50만원 혜택',
  },
  {
    name: '삼성 iD SIMPLE 카드',
    corpName: '삼성카드',
    tags: ['온라인쇼핑', '배달', '구독'],
    benefit: [
      '온라인 쇼핑 10% 적립',
      '배달앱 5,000원 할인',
      'OTT 구독료 50% 할인',
      '카페 음료 1+1',
    ],
    promotion: {
      title: '첫 이용 혜택',
      terms:
        '최초 이용일로부터 1개월 내 20만원 이상 결제 시 CGV 영화 관람권 2매 증정',
    },
    payback: '월 최대 3만원 할인',
  },
  {
    name: 'KB국민 티타늄 카드',
    corpName: 'KB국민카드',
    tags: ['주유', '대중교통', '마트'],
    benefit: [
      '주유 리터당 150원 할인',
      '대중교통 10% 할인',
      '대형마트 5% 할인',
      '편의점 3% 적립',
    ],
    promotion: {
      title: '연회비 혜택',
      terms: '전월 실적 30만원 이상 시 연회비 50% 할인',
    },
    payback: '실적 달성 시 연회비 면제',
  },
  {
    name: '현대카드 M Edition3',
    corpName: '현대카드',
    tags: ['외식', '카페', '문화생활'],
    benefit: [
      '외식 업종 10% 할인',
      '스타벅스 30% 할인',
      '영화관 50% 할인',
      '서점 10% 적립',
    ],
    promotion: {
      title: '프리미엄 혜택',
      terms: '월 이용금액 50만원 이상 시 M포인트 5만점 적립',
    },
    payback: '월 최대 5만원 혜택',
  },
  {
    name: 'NH농협 올원 영 카드',
    corpName: 'NH농협카드',
    tags: ['생활', '통신', '온라인'],
    benefit: [
      '통신요금 자동납부 시 10% 할인',
      '온라인 쇼핑 5% 적립',
      '편의점/마트 3% 적립',
      '주유 2% 적립',
    ],
    promotion: {
      title: '청년 우대 혜택',
      terms: '만 19~34세 신규 발급 시 첫 1년 연회비 면제',
    },
    payback: '연 최대 30만원 할인',
  },
  {
    name: '우리 My WE:SH 카드',
    corpName: '우리카드',
    tags: ['쇼핑', '배달', '구독'],
    benefit: [
      '온라인 쇼핑 7% 할인',
      '배달앱 5% 할인',
      '구독 서비스 10% 할인',
      '편의점 2% 적립',
    ],
    promotion: {
      title: '맞춤형 혜택',
      terms: '주 이용 업종 자동 선택하여 추가 3% 할인',
    },
    payback: '월 최대 4만원 할인',
  },
  {
    name: '하나카드 1Q',
    corpName: '하나카드',
    tags: ['주유', '쇼핑', '외식'],
    benefit: [
      '주유 리터당 200원 할인',
      '대형마트 10% 할인',
      '외식 업종 5% 할인',
      '해외 이용 2% 적립',
    ],
    promotion: {
      title: '분기별 혜택',
      terms: '분기 실적 100만원 이상 시 1Q 포인트 1만점 적립',
    },
    payback: '분기 최대 10만원 혜택',
  },
  {
    name: '롯데 L.POINT 카드',
    corpName: '롯데카드',
    tags: ['쇼핑', '영화', '면세점'],
    benefit: [
      '롯데백화점 10% 할인',
      '롯데시네마 50% 할인',
      '롯데면세점 5% 할인',
      'L.POINT 2배 적립',
    ],
    promotion: {
      title: 'L.POINT 통합 혜택',
      terms: '월 30만원 이상 이용 시 L.POINT 5,000점 추가 적립',
    },
    payback: '월 최대 3만원 L.POINT 적립',
  },
  {
    name: '비씨 바로 V2 카드',
    corpName: 'BC카드',
    tags: ['생활', '통신', '교통'],
    benefit: [
      '통신요금 5% 할인',
      '대중교통 10% 할인',
      '편의점 3% 할인',
      '주유 1% 적립',
    ],
    promotion: {
      title: '간편 혜택',
      terms: '별도 실적 없이 기본 혜택 제공',
    },
    payback: '실적 무관 기본 혜택',
  },
  {
    name: 'IBK기업 S20 카드',
    corpName: 'IBK기업은행',
    tags: ['주유', '마트', '병원'],
    benefit: [
      '주유 리터당 100원 할인',
      '대형마트 5% 할인',
      '병원/약국 3% 할인',
      '통신요금 3% 할인',
    ],
    promotion: {
      title: '소상공인 우대',
      terms: '소상공인 이용 시 추가 2% 할인',
    },
    payback: '월 최대 2만원 할인',
  },
  {
    name: '카카오페이 카드',
    corpName: '카카오페이',
    tags: ['온라인', '배달', '간편결제'],
    benefit: [
      '카카오페이 결제 10% 적립',
      '배달의민족 5,000원 할인',
      '쿠팡 5% 할인',
      '카카오톡 선물하기 10% 할인',
    ],
    promotion: {
      title: '디지털 혜택',
      terms: '온라인 결제 시 즉시 할인 및 포인트 적립',
    },
    payback: '월 최대 5만원 할인',
  },
  {
    name: '토스뱅크 체크카드',
    corpName: '토스뱅크',
    tags: ['온라인', '구독', '간편결제'],
    benefit: [
      '토스페이 결제 5% 적립',
      'OTT 구독료 30% 할인',
      '편의점 2% 적립',
      '카페 1+1',
    ],
    promotion: {
      title: '토스뱅크 고객 혜택',
      terms: '토스뱅크 입출금 계좌 연결 시 추가 혜택 제공',
    },
    payback: '월 최대 3만원 할인',
  },
  {
    name: '신세계 이마트 e 카드',
    corpName: '신세계카드',
    tags: ['마트', '백화점', '편의점'],
    benefit: [
      '이마트 5% 할인',
      '신세계백화점 10% 할인',
      '편의점 3% 할인',
      'SSG페이 5% 적립',
    ],
    promotion: {
      title: '신세계 통합 혜택',
      terms: '신세계 계열사 이용 시 포인트 2배 적립',
    },
    payback: '월 최대 4만원 할인',
  },
  {
    name: 'CU 멤버스 카드',
    corpName: 'BGF리테일',
    tags: ['편의점', '배달', '생활'],
    benefit: [
      'CU 편의점 10% 할인',
      '배달앱 5% 할인',
      '카페 3% 할인',
      'GS칼텍스 주유 2% 적립',
    ],
    promotion: {
      title: '편의점 특화 혜택',
      terms: 'CU 이용 시 즉시 할인 및 포인트 적립',
    },
    payback: '월 최대 2만원 할인',
  },
  {
    name: '제주항공 JTO 카드',
    corpName: '제주은행',
    tags: ['여행', '항공', '호텔'],
    benefit: [
      '제주항공 항공권 10% 할인',
      '호텔/리조트 5% 할인',
      '렌터카 10% 할인',
      '공항라운지 무료 이용',
    ],
    promotion: {
      title: '여행 특화 혜택',
      terms: '제주항공 이용 시 마일리지 2배 적립',
    },
    payback: '연 최대 20만원 항공권 할인',
  },
]

// ============================================
// 광고 배너 샘플 데이터
// ============================================
const SAMPLE_ADBANNERS: AdBanner[] = [
  {
    title: '새해맞이 카드 신규 발급 이벤트',
    description: '지금 신청하면 스타벅스 아메리카노 쿠폰 증정!',
    link: 'https://www.example.com/event1',
  },
  {
    title: '최대 50만원 캐시백 혜택',
    description: '프리미엄 카드 신규 가입 고객 대상 특별 혜택',
    link: 'https://www.example.com/event2',
  },
  {
    title: '연회비 평생 면제 이벤트',
    description: '첫 이용 고객 대상 연회비 영구 면제',
    link: 'https://www.example.com/event3',
  },
]

// ============================================
// 데이터베이스 초기화 함수
// ============================================
async function seedDatabase() {
  console.log('🌱 데이터베이스 초기화 시작...\n')

  try {
    // ========== 카드 데이터 추가 ==========
    console.log('📇 카드 데이터 생성 중...')
    const cardBatch = writeBatch(store)
    const cardsCollection = collection(store, COLLECTIONS.CARD)

    SAMPLE_CARDS.forEach((card, index) => {
      const cardRef = doc(
        cardsCollection,
        `card-${String(index + 1).padStart(3, '0')}`,
      )
      cardBatch.set(cardRef, card)
    })

    await cardBatch.commit()
    console.log(`✅ 카드 ${SAMPLE_CARDS.length}개 생성 완료\n`)

    // ========== 광고 배너 데이터 추가 ==========
    console.log('🎯 광고 배너 데이터 생성 중...')
    const adBatch = writeBatch(store)
    const adBannersCollection = collection(store, COLLECTIONS.ADBANNER)

    SAMPLE_ADBANNERS.forEach((banner, index) => {
      const bannerRef = doc(adBannersCollection, `banner-${index + 1}`)
      adBatch.set(bannerRef, banner)
    })

    await adBatch.commit()
    console.log(`✅ 광고 배너 ${SAMPLE_ADBANNERS.length}개 생성 완료\n`)

    // ========== 완료 메시지 ==========
    console.log('🎉 데이터베이스 초기화 완료!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 총 생성된 데이터:`)
    console.log(`   - 카드: ${SAMPLE_CARDS.length}개`)
    console.log(`   - 광고 배너: ${SAMPLE_ADBANNERS.length}개`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error)
    throw error
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✨ 스크립트 실행 완료')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 중 오류:', error)
      process.exit(1)
    })
}

export default seedDatabase
