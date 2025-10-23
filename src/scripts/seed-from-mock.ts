import { collection, writeBatch, doc } from 'firebase/firestore'
import { store } from '@/remote/firebase'
import { COLLECTIONS } from '@/constants'
import { card_list, adBanners } from '@/mock/data'

/**
 * Mock 데이터를 Firebase Firestore에 업로드하는 스크립트
 * - CARD 컬렉션: card_list 데이터 (10개)
 * - ADBANNER 컬렉션: adBanners 데이터 (2개)
 */
async function seedFromMock() {
  console.log('🌱 Mock 데이터로 Firebase 초기화 시작...\n')

  try {
    // ========== 카드 데이터 추가 ==========
    console.log('📇 카드 데이터 업로드 중...')
    const cardBatch = writeBatch(store)
    const cardsCollection = collection(store, COLLECTIONS.CARD)

    card_list.forEach((card, index) => {
      const cardRef = doc(
        cardsCollection,
        `card-${String(index + 1).padStart(3, '0')}`,
      )
      cardBatch.set(cardRef, card)
      console.log(`   ✓ ${index + 1}. ${card.name}`)
    })

    await cardBatch.commit()
    console.log(`\n✅ 카드 ${card_list.length}개 업로드 완료\n`)

    // ========== 광고 배너 데이터 추가 ==========
    console.log('🎯 광고 배너 데이터 업로드 중...')
    const adBatch = writeBatch(store)
    const adBannersCollection = collection(store, COLLECTIONS.ADBANNER)

    adBanners.forEach((banner, index) => {
      const bannerRef = doc(adBannersCollection, `banner-${index + 1}`)
      adBatch.set(bannerRef, banner)
      console.log(`   ✓ ${index + 1}. ${banner.title}`)
    })

    await adBatch.commit()
    console.log(`\n✅ 광고 배너 ${adBanners.length}개 업로드 완료\n`)

    // ========== 완료 메시지 ==========
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 Firebase 초기화 완료!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 업로드된 데이터:`)
    console.log(`   - 카드 (CARD): ${card_list.length}개`)
    console.log(`   - 광고 배너 (ADBANNER): ${adBanners.length}개`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('✨ 이제 홈페이지에서 카드 목록을 확인할 수 있습니다!')
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error)
    throw error
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  seedFromMock()
    .then(() => {
      console.log('✅ 스크립트 실행 완료')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 중 오류:', error)
      process.exit(1)
    })
}

export default seedFromMock
