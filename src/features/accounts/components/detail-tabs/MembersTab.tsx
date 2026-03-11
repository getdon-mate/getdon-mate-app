import { StyleSheet, Text, View } from "react-native"
import { getMemberPaymentRate } from "../../model/mock-data"
import type { GroupAccount } from "../../model/types"
import { MemberRow } from "../MemberRow"
import { SectionCard } from "../SectionCard"

export function MembersTab({ account }: { account: GroupAccount }) {
  const avgRate =
    account.members.reduce((sum, member) => sum + getMemberPaymentRate(account.duesRecords, member.id), 0) /
    Math.max(account.members.length, 1)

  return (
    <View style={styles.stack}>
      <SectionCard>
        <Text style={styles.metricText}>총 멤버 {account.members.length}명</Text>
        <Text style={styles.metricText}>평균 납부율 {Math.round(avgRate)}%</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>멤버 목록</Text>
        <View style={styles.stackCompact}>
          {account.members.map((member) => {
            const rate = getMemberPaymentRate(account.duesRecords, member.id)
            return <MemberRow key={member.id} member={member} rate={rate} duesRecords={account.duesRecords} />
          })}
        </View>
      </SectionCard>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  stackCompact: {
    gap: 10,
    marginTop: 10,
  },
  metricText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
})
