import type { DuesRecord, Member } from "./types"

export function getMemberById(members: Member[], id: string): Member | undefined {
  return members.find((member) => member.id === id)
}

export function getMemberDuesHistory(duesRecords: DuesRecord[], memberId: string): DuesRecord[] {
  return duesRecords.filter((record) => record.memberId === memberId)
}

export function getMemberPaymentRate(duesRecords: DuesRecord[], memberId: string): number {
  const records = getMemberDuesHistory(duesRecords, memberId)
  if (records.length === 0) return 0
  const paidOrExempt = records.filter((record) => record.status === "paid" || record.status === "exempt").length
  return Math.round((paidOrExempt / records.length) * 100)
}
