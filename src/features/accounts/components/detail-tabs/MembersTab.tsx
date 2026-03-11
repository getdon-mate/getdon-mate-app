import { StyleSheet, Text, View } from "react-native"
import { getMemberPaymentRate } from "../../model/mock-data"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { MemberRow } from "../MemberRow"
import { SectionCard } from "../SectionCard"

export function MembersTab({ account }: { account: GroupAccount }) {
  const avgRate =
    account.members.reduce((sum, member) => sum + getMemberPaymentRate(account.duesRecords, member.id), 0) /
    Math.max(account.members.length, 1)

  return (
    <View style={styles.stack}>
      <View style={styles.summaryRow}>
        <SectionCard>
          <Text style={styles.summaryLabel}>총 멤버</Text>
          <Text style={styles.metricText}>{account.members.length}명</Text>
        </SectionCard>
        <SectionCard>
          <Text style={styles.summaryLabel}>평균 납부율</Text>
          <Text style={styles.metricText}>{Math.round(avgRate)}%</Text>
        </SectionCard>
      </View>

      {account.members.length > 0 ? (
        <SectionCard>
          <Text style={styles.sectionTitle}>멤버 목록</Text>
          <View style={styles.stackCompact}>
            {account.members.map((member) => {
              const rate = getMemberPaymentRate(account.duesRecords, member.id)
              return <MemberRow key={member.id} member={member} rate={rate} duesRecords={account.duesRecords} />
            })}
          </View>
        </SectionCard>
      ) : (
        <EmptyStateCard
          title="등록된 멤버가 없습니다."
          description="멤버가 추가되면 역할과 납부율 정보를 이 화면에서 확인할 수 있습니다."
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  stackCompact: {
    gap: 10,
    marginTop: 10,
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
  metricText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
})
