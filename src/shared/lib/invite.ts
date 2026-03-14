import type { GroupAccount } from "@features/accounts/model/types"

export function buildAccountInviteLink(account: Pick<GroupAccount, "id" | "groupName">) {
  const slug = encodeURIComponent(account.groupName.trim().toLowerCase().replace(/\s+/g, "-"))
  return `https://getdon.app/invite/${account.id}?group=${slug}`
}
