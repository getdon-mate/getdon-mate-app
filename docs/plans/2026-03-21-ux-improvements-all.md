# UI/UX 전체 개선 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 감사 보고서에서 식별된 P0~P3 UI/UX 문제 8개를 우선순위 순으로 모두 수정한다.

**Architecture:** 디자인 시스템 토큰과 공유 컴포넌트를 먼저 수정해 파급 효과를 최대화하고, 개별 화면 수정은 그 이후에 진행한다. 외부 라이브러리 추가 없이 React Native 내장 API만 사용.

**Tech Stack:** Expo React Native, TypeScript, StyleSheet, SectionList, FlatList, Modal

---

## Task 1 (P0-A): 터치 타겟 44px 확보 — recipes.ts + 공통 컴포넌트

**Files:**
- Modify: `src/shared/ui/recipes.ts`
- Modify: `src/features/accounts/components/detail-tabs/BoardTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/MembersTab.tsx`

### Step 1: recipes.ts — roundIconButton 44px로 변경

`src/shared/ui/recipes.ts` 의 `roundIconButton` 와 `avatar` 수정:

```typescript
// before
roundIconButton: {
  width: 32,
  height: 32,
  borderRadius: 16,
  ...
},
avatar: {
  width: 32,
  height: 32,
  borderRadius: 16,
  ...
  paddingTop: 8,
},

// after
roundIconButton: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: uiColors.surfaceMuted,
  borderWidth: 1,
  borderColor: uiColors.border,
  alignItems: "center",
  justifyContent: "center",
},
// avatar 는 시각적 요소(이니셜 표시)이므로 크기 유지, 터치 타겟은 래퍼에서 처리
```

### Step 2: BoardTab — inlineIconButton + 댓글 전송 버튼 hitSlop 추가

`BoardTab.tsx` 에서 `inlineIconButton` 스타일(28×28)을 사용하는 Pressable 에 hitSlop 추가:

```typescript
// 게시물 수정/삭제 메뉴 버튼 (postMenuWrap 안의 Pressable)
<Pressable
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  style={styles.inlineIconButton}
  ...
>

// 댓글 전송 버튼 (commentSendButton: 34×34)
// styles.commentSendButton 을 44×44로 변경
commentSendButton: {
  width: 44,
  height: 44,
  borderRadius: 22,
  ...
},
```

### Step 3: TransactionsTab — menuButton hitSlop 추가

`TransactionsTab.tsx` menuButton Pressable (34×34):

```typescript
<Pressable
  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
  style={[styles.menuButton, ...]}
  ...
>
```

### Step 4: MembersTab — 모달 닫기 버튼 44px로 변경

`MembersTab.tsx` 모달 닫기 버튼 스타일 직접 수정:

```typescript
// before
closeButton: { width: 32, height: 32, borderRadius: 16 }
// after
closeButton: { width: 44, height: 44, borderRadius: 22 }
```

### Step 5: 커밋

```bash
git add src/shared/ui/recipes.ts \
  src/features/accounts/components/detail-tabs/BoardTab.tsx \
  src/features/accounts/components/detail-tabs/TransactionsTab.tsx \
  src/features/accounts/components/detail-tabs/MembersTab.tsx
git commit -m "fix(ux): 터치 타겟 44px 최소 규격 적용 (P0)"
```

---

## Task 2 (P0-B): 비활성 소셜 로그인 버튼 제거

**Files:**
- Modify: `src/features/auth/components/AuthFormCard.tsx`

### Step 1: socialStack 섹션 완전 제거

`AuthFormCard.tsx` 에서 `!isSignup` 조건으로 렌더링되는 socialStack View 전체를 제거:

```typescript
// 제거 대상 (lines 41-52)
{!isSignup ? (
  <View style={styles.socialStack}>
    <Pressable ...>Google로 계속하기 (준비 중)</Pressable>
    <Pressable ...>카카오로 계속하기 (준비 중)</Pressable>
  </View>
) : null}
```

PropTypes 에서 `onSocialLogin` 제거, 호출부(`LoginScreen.tsx`) 에서 `onSocialLogin` prop 과 `handleSocialLogin` 함수 제거.

`AuthFormCard` 인터페이스:
```typescript
// 제거
onSocialLogin: (provider: "google" | "kakao") => void
```

`LoginScreen.tsx` 에서:
```typescript
// 제거
const handleSocialLogin = (provider: "google" | "kakao") => { ... }
// 제거
onSocialLogin={handleSocialLogin}
```

`styles` 에서도 사용하지 않는 `socialStack`, `socialButton`, `socialButtonDisabled`, `socialButtonText`, `socialButtonTextDisabled` 제거.

### Step 2: 커밋

```bash
git add src/features/auth/components/AuthFormCard.tsx \
  src/features/auth/screens/LoginScreen.tsx
git commit -m "fix(ux): 미구현 소셜 로그인 버튼 제거 (P0)"
```

---

## Task 3 (P1-A): TransactionsTab 가상화 (SectionList)

**Files:**
- Modify: `src/features/accounts/screens/AccountDetailScreen.tsx`
- Modify: `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`

### Step 1: AccountDetailScreen — transactions 탭 ScrollView에서 분리

현재 모든 탭 콘텐츠가 하나의 `ScrollView` 안에 있다. TransactionsTab이 자체 스크롤을 가지도록 분리:

```typescript
// AccountDetailScreen.tsx — ScrollView 조건 분기
{tab === "transactions" ? (
  // TransactionsTab 은 자체 SectionList 스크롤 보유
  <View style={[styles.contentWrap, isWide && styles.contentWrapWide, styles.flexFill]}>
    <TransactionsTab
      account={account}
      initialType={transactionComposerType}
      composerSignal={transactionComposerSignal}
    />
  </View>
) : (
  <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
    <View style={[styles.contentWrap, isWide && styles.contentWrapWide]}>
      {isBootstrapping ? ( ... )
       : tab === "dashboard" ? ( ... )
       // ... other tabs
      }
    </View>
  </ScrollView>
)}
```

styles 에 추가:
```typescript
flexFill: { flex: 1 },
```

### Step 2: TransactionsTab — SectionList 전환

TransactionsTab 의 return 문에서 날짜별 `.map()` 렌더링을 `SectionList` 로 교체:

```typescript
import { SectionList, ... } from "react-native"

// return 문 구조 변경
// 폼(SectionCard)과 필터(SectionCard)를 ListHeaderComponent 로 이동
// 날짜별 거래 그룹을 sections 로 변환

type TxSection = { title: string; data: Transaction[] }

const sections: TxSection[] = dates.map((d) => ({
  title: d,
  data: grouped[d],
}))

return (
  <SectionList<Transaction, TxSection>
    sections={sections}
    keyExtractor={(item) => item.id}
    style={styles.sectionList}
    contentContainerStyle={styles.sectionListContent}
    staleWhileRevalidate
    ListHeaderComponent={
      <View style={styles.headerStack}>
        {/* 폼 SectionCard */}
        <SectionCard> ... </SectionCard>
        {/* 필터 SectionCard */}
        <SectionCard> ... </SectionCard>
        {/* 요약 텍스트, 편집 메타 */}
      </View>
    }
    renderSectionHeader={({ section }) => (
      <SectionCard style={styles.sectionDateCard}>
        <Text style={styles.subtleText}>{formatFullDate(section.title)}</Text>
      </SectionCard>
    )}
    renderItem={({ item: tx, section }) => (
      <View style={[styles.transactionCard, ...]}>
        ...
      </View>
    )}
    ListEmptyComponent={
      isMutating ? (
        <View style={styles.headerStack}>
          <LoadingStateCard lines={4} />
          <LoadingStateCard lines={3} />
        </View>
      ) : (
        <EmptyStateCard ... />
      )
    }
    ListFooterComponent={
      selectedTransaction ? (
        <Text style={styles.editingMeta}>...</Text>
      ) : null
    }
  />
)
```

스타일 추가:
```typescript
sectionList: { flex: 1 },
sectionListContent: { paddingHorizontal: 14, paddingBottom: 18 },
headerStack: { gap: 12, marginBottom: 4 },
sectionDateCard: { marginBottom: 0 },
```

### Step 3: 커밋

```bash
git add src/features/accounts/screens/AccountDetailScreen.tsx \
  src/features/accounts/components/detail-tabs/TransactionsTab.tsx
git commit -m "perf(ux): TransactionsTab SectionList 가상화 적용 (P1)"
```

---

## Task 4 (P1-B): ActionSheet 공유 컴포넌트 + 인라인 드롭다운 교체

**Files:**
- Create: `src/shared/ui/primitives/ActionSheet.tsx`
- Modify: `src/shared/ui/index.ts`
- Modify: `src/features/accounts/components/detail-tabs/BoardTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`

### Step 1: ActionSheet 컴포넌트 생성

`src/shared/ui/primitives/ActionSheet.tsx`:

```typescript
import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { uiColors, uiRadius, uiSpacing } from "../tokens"

export interface ActionSheetItem {
  label: string
  icon?: React.ReactNode
  onPress: () => void
  tone?: "default" | "danger"
  disabled?: boolean
}

interface ActionSheetProps {
  visible: boolean
  title?: string
  items: ActionSheetItem[]
  onClose: () => void
}

export function ActionSheet({ visible, title, items, onClose }: ActionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {items.map((item, index) => (
            <Pressable
              key={index}
              style={[
                styles.item,
                index > 0 && styles.itemDivider,
                item.disabled && styles.itemDisabled,
              ]}
              onPress={() => {
                if (item.disabled) return
                onClose()
                item.onPress()
              }}
              disabled={item.disabled}
            >
              {item.icon}
              <Text style={[styles.itemText, item.tone === "danger" && styles.itemTextDanger]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
          <Pressable style={[styles.item, styles.itemDivider, styles.cancelItem]} onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: uiColors.overlayStrong,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: uiColors.surface,
    borderTopLeftRadius: uiRadius.xl,
    borderTopRightRadius: uiRadius.xl,
    paddingBottom: uiSpacing.xxl,
    overflow: "hidden",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: uiColors.textMuted,
    textAlign: "center",
    paddingVertical: uiSpacing.md,
    paddingHorizontal: uiSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: uiColors.border,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.sm,
    paddingHorizontal: uiSpacing.lg,
    paddingVertical: 16,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: uiColors.border,
  },
  itemDisabled: { opacity: 0.4 },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: uiColors.textStrong,
  },
  itemTextDanger: { color: uiColors.danger },
  cancelItem: {
    marginTop: uiSpacing.sm,
    borderTopWidth: 2,
    borderTopColor: uiColors.border,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "700",
    color: uiColors.textMuted,
    textAlign: "center",
    flex: 1,
  },
})
```

### Step 2: index.ts 에 ActionSheet export 추가

`src/shared/ui/index.ts` 에 추가:
```typescript
export * from "./primitives/ActionSheet"
```

### Step 3: TransactionsTab — 인라인 메뉴 → ActionSheet

`TransactionsTab.tsx`:
```typescript
import { ActionSheet, ... } from "@shared/ui"

// menuOpenId 를 selectedTxForMenu 로 이름 변경 (Transaction | null)
const [selectedTxForMenu, setSelectedTxForMenu] = useState<Transaction | null>(null)

// 각 transaction 카드에서 menuInlinePanel 제거, menuButton onPress 변경
<Pressable
  onPress={() => setSelectedTxForMenu(tx)}
  ...
>
  <Icon name="ellipsis" size={16} color={uiColors.textStrong} />
</Pressable>

// SectionList 밖 (return 최상위) ActionSheet 추가
<ActionSheet
  visible={selectedTxForMenu !== null}
  title={selectedTxForMenu?.description}
  items={[
    {
      label: "수정",
      onPress: () => selectedTxForMenu && handleEdit(selectedTxForMenu),
      disabled: isMutating,
    },
    {
      label: "삭제",
      tone: "danger",
      onPress: () => selectedTxForMenu && void handleDelete(selectedTxForMenu),
      disabled: isMutating,
    },
  ]}
  onClose={() => setSelectedTxForMenu(null)}
/>
```

`handleDelete` 에서 `setMenuOpenId(null)` → `setSelectedTxForMenu(null)` 으로 업데이트.

menuButton, menuInlinePanel, menuWrap 관련 스타일 제거 (또는 사용 안 함으로 정리).

### Step 4: BoardTab — 절대 위치 메뉴 → ActionSheet

`BoardTab.tsx`:
```typescript
import { ActionSheet, ... } from "@shared/ui"

// postMenuOpenId, commentMenuOpenId 상태 타입 변경
// string | null → { id: string; type: "post" | "comment" } | null
const [openMenu, setOpenMenu] = useState<{ id: string; type: "post" | "comment" } | null>(null)

// postMenuPanel / commentMenuPanel (position: absolute) 제거
// 해당 버튼 onPress 변경: setOpenMenu({ id: post.id, type: "post" })

// 게시물 ActionSheet
<ActionSheet
  visible={openMenu?.type === "post"}
  title="게시물"
  items={[
    { label: "수정", onPress: () => ... },
    { label: "삭제", tone: "danger", onPress: () => ... },
  ]}
  onClose={() => setOpenMenu(null)}
/>
// 댓글 ActionSheet
<ActionSheet
  visible={openMenu?.type === "comment"}
  title="댓글"
  items={[
    { label: "수정", onPress: () => ... },
    { label: "삭제", tone: "danger", onPress: () => ... },
  ]}
  onClose={() => setOpenMenu(null)}
/>
```

postMenuWrap, postMenuPanel, postMenuItem, commentMenuWrap, commentMenuPanel 관련 스타일 제거.

### Step 5: 커밋

```bash
git add src/shared/ui/primitives/ActionSheet.tsx \
  src/shared/ui/index.ts \
  src/features/accounts/components/detail-tabs/TransactionsTab.tsx \
  src/features/accounts/components/detail-tabs/BoardTab.tsx
git commit -m "feat(ux): ActionSheet 공유 컴포넌트 추가 + 인라인 드롭다운 교체 (P1)"
```

---

## Task 5 (P2-A): 탭 그룹화 — 5개 기본 탭 + 더보기 트레이

**Files:**
- Modify: `src/features/accounts/components/detail/DetailTabBar.tsx`
- Modify: `src/features/accounts/screens/AccountDetailScreen.tsx`

### Step 1: DetailTabBar 구조 변경

```typescript
// DetailTabBar.tsx
// PRIMARY: 홈, 거래, 회비, 멤버, (더보기)
// MORE: 통계, 일정, 게시판, 관리

export const PRIMARY_TABS: DetailTab[] = ["dashboard", "transactions", "dues", "members"]

const MORE_TABS: DetailTab[] = ["statistics", "calendar", "board", "settings"]

const ALL_TAB_LABELS: Record<DetailTab, string> = {
  dashboard: "홈",
  transactions: "거래",
  dues: "회비",
  members: "멤버",
  statistics: "통계",
  calendar: "일정",
  board: "게시판",
  settings: "관리",
}

export function DetailTabBar({ activeTab, onChangeTab }: { ... }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const isMoreActive = MORE_TABS.includes(activeTab)

  return (
    <>
      {/* 더보기 모달 */}
      <Modal
        visible={moreOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMoreOpen(false)}
      >
        <Pressable style={styles.moreOverlay} onPress={() => setMoreOpen(false)}>
          <View style={styles.moreSheet}>
            <Text style={styles.moreTitle}>더 보기</Text>
            {MORE_TABS.map((tabKey) => (
              <Pressable
                key={tabKey}
                style={[styles.moreItem, activeTab === tabKey && styles.moreItemActive]}
                onPress={() => {
                  onChangeTab(tabKey)
                  setMoreOpen(false)
                }}
              >
                <Text style={[styles.moreItemLabel, activeTab === tabKey && styles.moreItemLabelActive]}>
                  {ALL_TAB_LABELS[tabKey]}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* 기본 탭 바 */}
      <View style={styles.bottomNav}>
        {PRIMARY_TABS.map((key) => {
          const active = activeTab === key
          return (
            <Pressable
              key={key}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => onChangeTab(key)}
              accessibilityRole="tab"
              accessibilityLabel={`${ALL_TAB_LABELS[key]} 탭`}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {ALL_TAB_LABELS[key]}
              </Text>
            </Pressable>
          )
        })}
        {/* 더보기 버튼 */}
        <Pressable
          style={[styles.navItem, isMoreActive && styles.navItemActive]}
          onPress={() => setMoreOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="더 보기"
        >
          <Text style={[styles.navLabel, isMoreActive && styles.navLabelActive]}>
            {isMoreActive ? ALL_TAB_LABELS[activeTab] : "더보기"}
          </Text>
        </Pressable>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 999,
    minHeight: 44,
  },
  navItemActive: { backgroundColor: uiColors.primarySoft },
  navLabel: { color: uiColors.textMuted, fontSize: 12, fontWeight: "600" },
  navLabelActive: { color: uiColors.primary, fontWeight: "800" },
  moreOverlay: {
    flex: 1,
    backgroundColor: uiColors.overlayStrong,
    justifyContent: "flex-end",
  },
  moreSheet: {
    backgroundColor: uiColors.surface,
    borderTopLeftRadius: uiRadius.xl,
    borderTopRightRadius: uiRadius.xl,
    paddingBottom: uiSpacing.xxl,
    overflow: "hidden",
  },
  moreTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: uiColors.textMuted,
    textAlign: "center",
    paddingVertical: uiSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: uiColors.border,
  },
  moreItem: {
    paddingHorizontal: uiSpacing.lg,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: uiColors.border,
  },
  moreItemActive: { backgroundColor: uiColors.primarySoft },
  moreItemLabel: { fontSize: 16, fontWeight: "600", color: uiColors.textStrong },
  moreItemLabelActive: { color: uiColors.primary },
})
```

### Step 2: DETAIL_TAB_META export 유지 (기존 코드 호환)

기존에 `DETAIL_TAB_META` 를 import 하는 곳이 있다면 유지. 없다면 제거 가능. 확인 후 처리.

### Step 3: 커밋

```bash
git add src/features/accounts/components/detail/DetailTabBar.tsx
git commit -m "feat(ux): 탭 8개 → 4+더보기 구조로 개편 (P2)"
```

---

## Task 6 (P2-B): 온보딩 개선 — AuthHero 기능 요약 + 게스트 버튼 강조

**Files:**
- Modify: `src/features/auth/components/AuthHero.tsx`
- Modify: `src/features/auth/components/AuthFormCard.tsx`

### Step 1: AuthHero — 핵심 기능 3줄 추가

```typescript
// AuthHero.tsx
const FEATURES = [
  "회비 납부 현황을 한눈에 확인",
  "입출금 내역 공동 관리",
  "모임원과 게시판으로 소통",
]

export function AuthHero() {
  return (
    <View style={styles.hero}>
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>gm</Text>
      </View>
      <Text style={styles.heroTitle}>getdon mate</Text>
      <Text style={styles.heroSubtitle}>모임 운영 흐름을 빠르게 확인하고 바로 정리하세요.</Text>
      <View style={styles.featureList}>
        {FEATURES.map((feature, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureDot}>•</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// 추가 스타일
featureList: {
  marginTop: 16,
  alignSelf: "stretch",
  gap: 6,
},
featureRow: {
  flexDirection: "row",
  gap: 8,
  alignItems: "flex-start",
},
featureDot: {
  color: uiColors.primary,
  fontSize: 14,
  fontWeight: "700",
  lineHeight: 20,
},
featureText: {
  color: uiColors.textMuted,
  fontSize: 13,
  lineHeight: 20,
  flex: 1,
},
```

### Step 2: AuthFormCard — "둘러보기" 버튼 ghost → secondary 변경 및 설명 추가

```typescript
// AuthFormCard.tsx — 게스트 버튼 교체
{!isSignup ? (
  <View style={styles.guestSection}>
    <Text style={styles.guestHint}>계정 없이 앱을 먼저 둘러볼 수 있습니다.</Text>
    <Button
      label="게스트로 둘러보기"
      variant="secondary"   // ghost → secondary
      onPress={onContinueAsGuest}
      disabled={submitting}
    />
  </View>
) : null}

// 추가 스타일
guestSection: {
  gap: 6,
},
guestHint: {
  textAlign: "center",
  color: uiColors.textMuted,
  fontSize: 12,
},
```

### Step 3: 커밋

```bash
git add src/features/auth/components/AuthHero.tsx \
  src/features/auth/components/AuthFormCard.tsx
git commit -m "feat(ux): 온보딩 기능 요약 추가 + 게스트 버튼 강조 (P2)"
```

---

## Task 7 (P3-A): 디자인 토큰 정리 — 하드코딩 값 교체

**Files:**
- Modify: `src/features/accounts/screens/AccountDetailScreen.tsx`
- Modify: `src/features/accounts/components/detail-tabs/BoardTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/MembersTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`

### Step 1: AccountDetailScreen — 빈 상태 스타일 토큰화

```typescript
import { uiTypography, uiSpacing } from "@shared/ui"

// before
emptyTitle: { color: uiColors.textStrong, fontSize: 16, fontWeight: "700" }
emptyDescription: { color: uiColors.textMuted, fontSize: 13 }
emptyWrap: { gap: 12, padding: 20 }
content: { marginTop: 8 }
contentContainer: { paddingHorizontal: 14, paddingBottom: 18 }
contentWrap: { gap: 12 }

// after
emptyTitle: { ...uiTypography.section }
emptyDescription: { ...uiTypography.body }
emptyWrap: { gap: uiSpacing.md, padding: uiSpacing.xl }
content: { marginTop: uiSpacing.sm }
contentContainer: { paddingHorizontal: uiSpacing.md + 2, paddingBottom: uiSpacing.lg + 2 }
// contentWrap gap: uiSpacing.md (12)
```

### Step 2: BoardTab — 주요 하드코딩 교체

게시물/댓글 텍스트 스타일에서 반복되는 패턴:
```typescript
// caption (fontSize:12, fontWeight:600 → uiTypography.caption)
// body (fontSize:14/15 → uiTypography.body)
// 간격 gap:8 → uiSpacing.sm, gap:12 → uiSpacing.md
```

BoardTab 스타일에서 변경:
- `sectionLabel` (fontSize:12, fontWeight:700) → `...uiTypography.caption, fontWeight:"700"`
- `commentAuthor` (fontSize:13) → `fontSize: uiTypography.body.fontSize - 1` 또는 별도 유지
- `gap: 8` 패턴이 많은 경우 → `gap: uiSpacing.sm`
- `gap: 12` → `gap: uiSpacing.md`
- `borderRadius: 14` → `borderRadius: uiRadius.md`
- `borderRadius: 18` → `borderRadius: uiRadius.lg`

### Step 3: TransactionsTab, MembersTab 동일 패턴 적용

공통 패턴:
- `fontSize: 12, fontWeight: "600/700"` → `...uiTypography.caption`
- `fontSize: 18, fontWeight: "800"` → `...uiTypography.metric`
- `gap: 8` → `gap: uiSpacing.sm`
- `gap: 12` → `gap: uiSpacing.md`
- `marginTop: 10` → `marginTop: uiSpacing.sm + 2` (or keep literal if semantic difference)
- `borderRadius: 14` → `borderRadius: uiRadius.md`

### Step 4: 커밋

```bash
git add src/features/accounts/screens/AccountDetailScreen.tsx \
  src/features/accounts/components/detail-tabs/BoardTab.tsx \
  src/features/accounts/components/detail-tabs/MembersTab.tsx \
  src/features/accounts/components/detail-tabs/TransactionsTab.tsx
git commit -m "refactor(ux): 하드코딩 px/fontSize 값 디자인 토큰으로 교체 (P3)"
```

---

## Task 8 (P3-B): 로딩 스켈레톤 커버리지 개선

**Files:**
- Modify: `src/features/accounts/screens/AccountDetailScreen.tsx`
- Modify: `src/features/accounts/components/detail-tabs/DuesTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/MembersTab.tsx`

### Step 1: AccountDetailScreen — 탭 전환 시 스켈레톤

현재 `isBootstrapping` 체크는 dashboard 탭에만 있음. 다른 탭도 isBootstrapping 중에는 스켈레톤 표시:

```typescript
// 각 탭 렌더링 전 isBootstrapping 가드
{tab === "dues" ? (
  isBootstrapping ? <LoadingStateCard lines={5} /> : <DuesTab ... />
) : null}
{tab === "members" ? (
  isBootstrapping ? <LoadingStateCard lines={4} /> : <MembersTab ... />
) : null}
// statistics, calendar, board, settings 도 동일
```

### Step 2: DuesTab — 데이터 없을 때 스켈레톤 추가

DuesTab 에서 account.members 나 dues 데이터가 없을 경우 LoadingStateCard 렌더링:

```typescript
// DuesTab.tsx 상단에서 isMutating 가져와서 사용
const { isMutating } = useAppRuntime()
```

(기존 코드에 isMutating 없다면 추가)

### Step 3: 커밋

```bash
git add src/features/accounts/screens/AccountDetailScreen.tsx \
  src/features/accounts/components/detail-tabs/DuesTab.tsx \
  src/features/accounts/components/detail-tabs/MembersTab.tsx
git commit -m "feat(ux): 탭 스켈레톤 커버리지 개선 (P3)"
```

---

## Task 9: 최종 전체 Push

```bash
git push origin main
```

---

## E2E 테스트 체크리스트

각 Task 완료 후 수동 확인:

### P0 터치 타겟
- [ ] BoardTab 메뉴 버튼 탭 응답성 (이전보다 쉽게 탭 가능한지)
- [ ] TransactionsTab 더보기(⋯) 버튼 탭 응답성
- [ ] MembersTab 모달 닫기 버튼 탭 응답성

### P0 소셜 로그인
- [ ] 로그인 화면에서 Google/카카오 버튼 미노출
- [ ] 로그인/회원가입/게스트 기능 정상 동작

### P1 가상화
- [ ] TransactionsTab 거래 추가/수정/삭제 정상 동작
- [ ] 거래 목록 스크롤 정상 (독립 스크롤)
- [ ] 폼 → 목록 스크롤 자연스러운지 확인

### P1 ActionSheet
- [ ] TransactionsTab 거래 카드 ⋯ → ActionSheet 표시
- [ ] ActionSheet 수정/삭제 동작
- [ ] ActionSheet 취소 버튼 동작
- [ ] BoardTab 게시물 메뉴 → ActionSheet
- [ ] BoardTab 댓글 메뉴 → ActionSheet

### P2 탭 그룹화
- [ ] 기본 탭 4개 + 더보기 표시
- [ ] 더보기 시트 표시/닫기
- [ ] 더보기 탭(통계/일정/게시판/관리) 이동 정상
- [ ] 더보기 탭 활성 시 탭바에 탭 이름 표시

### P2 온보딩
- [ ] 로그인 화면에 기능 설명 3줄 표시
- [ ] "게스트로 둘러보기" secondary 스타일
- [ ] 게스트 로그인 정상 동작

### P3 토큰 + 스켈레톤
- [ ] 앱 전반 UI 색상/간격 이상 없음
- [ ] 부트스트랩 중 모든 탭 스켈레톤 표시
