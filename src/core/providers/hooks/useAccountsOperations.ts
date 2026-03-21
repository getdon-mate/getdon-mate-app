import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { type UseMutationResult } from "@tanstack/react-query"
import { createAccountsBackendV1Adapter } from "@features/accounts/api"
import { fetchMyMeetings, type SwaggerMeetingSummary } from "@features/accounts/api/swagger-api"
import { toGroupAccountSummary } from "@features/accounts/api/mappers"
import type { AppUser, AutoTransfer, GroupAccount, OneTimeDues, OneTimeDuesRecord, ReminderType } from "@features/accounts/model/types"
import type { NotificationItem } from "@shared/lib/notification-state"
import type { Dispatch, SetStateAction } from "react"
import {
  buildBoardComment,
  buildBoardPost,
  cloneAccounts,
  createLocalAccount,
  createLocalMember,
  createLocalTransaction,
  createReminder,
  createReminderNotification,
  getTransactionImpact,
  normalizeMemberRoles,
  buildMemberInitials,
  sortTransactions,
  type CreateAccountInput,
  type CreateBoardCommentInput,
  type CreateBoardPostInput,
  type UpsertMemberInput,
  type UpsertTransactionInput,
} from "../helpers"

type DataSource = "demo" | "remote"

interface UpdateBoardPostInput {
  title: string
  body: string
  pinned: boolean
}

interface UpdateBoardCommentInput {
  body: string
}

interface UpdateAccountInput {
  groupName: string
  bankName: string
  accountNumber: string
  monthlyDuesAmount: number
  dueDay: number
}

interface UpdateOneTimeDuesInput {
  title: string
  amount: number
  dueDate: string
}

interface CreateOneTimeDuesInput {
  title: string
  amount: number
  dueDate: string
}

interface AccountsOperationsInput {
  backendAdapter: ReturnType<typeof createAccountsBackendV1Adapter>
  prefersRealApi: boolean
  runBusy: <T>(task: () => Promise<T>) => Promise<T>
  currentUser: AppUser | null
  authTokens: { accessToken: string; refreshToken: string } | null
  accounts: GroupAccount[]
  selectedAccountId: string | null
  setAccounts: Dispatch<SetStateAction<GroupAccount[]>>
  setSelectedAccountId: Dispatch<SetStateAction<string | null>>
  setNotifications: Dispatch<SetStateAction<NotificationItem[]>>
  setDataSource: Dispatch<SetStateAction<DataSource>>
  swaggerCreateMeetingMutation: UseMutationResult<null, Error, { accessToken: string; title: string; bankName: string; bankAccount: string }, unknown>
}

export function useAccountsOperations({
  backendAdapter,
  prefersRealApi,
  runBusy,
  currentUser,
  authTokens,
  accounts,
  selectedAccountId,
  setAccounts,
  setSelectedAccountId,
  setNotifications,
  setDataSource,
  swaggerCreateMeetingMutation,
}: AccountsOperationsInput) {
  const queryClient = useQueryClient()

  const selectAccount = useCallback((id: string) => {
    setSelectedAccountId(id)
  }, [setSelectedAccountId])

  const clearSelectedAccount = useCallback(() => {
    setSelectedAccountId(null)
  }, [setSelectedAccountId])

  const createAccount = useCallback(
    async (data: CreateAccountInput) => {
      if (!currentUser) return

      await runBusy(async () => {
        if (prefersRealApi && authTokens?.accessToken) {
          await swaggerCreateMeetingMutation.mutateAsync({
            accessToken: authTokens.accessToken,
            title: data.groupName,
            bankName: data.bankName,
            bankAccount: data.accountNumber,
          })
          const meetings = await queryClient.fetchQuery({
            queryKey: ["swaggerMeetings", authTokens.accessToken],
            queryFn: () => fetchMyMeetings(authTokens.accessToken),
          })
          setAccounts(cloneAccounts(meetings.map((meeting: SwaggerMeetingSummary) => toGroupAccountSummary(meeting, currentUser))))
          setDataSource("remote")
          return
        }

        // 데모/로컬 모드: 로컬에서 계정 생성
        const newAccount = createLocalAccount(data, currentUser)
        setAccounts((prev) => [...prev, newAccount])
      })
    },
    [authTokens?.accessToken, currentUser, prefersRealApi, queryClient, runBusy, setAccounts, setDataSource, swaggerCreateMeetingMutation]
  )

  const deleteAccount = useCallback(
    async (id: string) => {
      await runBusy(async () => {
        setAccounts((prev) => prev.filter((acc) => acc.id !== id))
        setSelectedAccountId((prev) => (prev === id ? null : prev))
        await backendAdapter.deleteAccount(id)
      })
    },
    [backendAdapter, runBusy, setAccounts, setSelectedAccountId]
  )

  const toggleDues = useCallback(
    async (memberId: string, month: string) => {
      if (!selectedAccountId) return

      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id !== selectedAccountId) return acc
            return {
              ...acc,
              duesRecords: acc.duesRecords.map((r) => {
                if (r.memberId !== memberId || r.month !== month) return r
                if (r.status === "unpaid") {
                  return { ...r, status: "paid" as const, paidDate: new Date().toISOString().split("T")[0], amount: acc.monthlyDuesAmount }
                }
                if (r.status === "paid") {
                  return { ...r, status: "unpaid" as const, paidDate: undefined }
                }
                return r
              }),
            }
          })
        )
        await backendAdapter.toggleDues(selectedAccountId, memberId, month)
      })
    },
    [backendAdapter, runBusy, selectedAccountId, setAccounts]
  )

  const updateAutoTransfer = useCallback(
    async (accountId: string, autoTransfer: AutoTransfer) => {
      await runBusy(async () => {
        setAccounts((prev) => prev.map((acc) => (acc.id === accountId ? { ...acc, autoTransfer } : acc)))
        await backendAdapter.updateAutoTransfer(accountId, autoTransfer)
      })
    },
    [backendAdapter, runBusy, setAccounts]
  )

  const updateAccount = useCallback(
    async (accountId: string, data: UpdateAccountInput) => {
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === accountId
              ? {
                  ...acc,
                  groupName: data.groupName,
                  bankName: data.bankName,
                  accountNumber: data.accountNumber,
                  monthlyDuesAmount: data.monthlyDuesAmount,
                  dueDay: data.dueDay,
                  autoTransfer: {
                    ...acc.autoTransfer,
                    dayOfMonth: data.dueDay,
                    amount: acc.autoTransfer.enabled ? acc.autoTransfer.amount : data.monthlyDuesAmount,
                  },
                }
              : acc
          )
        )
        await backendAdapter.updateAccount(accountId, data)
      })
    },
    [backendAdapter, runBusy, setAccounts]
  )

  const createOneTimeDues = useCallback(
    async (accountId: string, data: CreateOneTimeDuesInput) => {
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id !== accountId) return acc
            const records: OneTimeDuesRecord[] = acc.members.map((m) => ({ memberId: m.id, status: "unpaid" as const }))
            const newDues: OneTimeDues = {
              id: `otd${Date.now()}`,
              title: data.title,
              amount: data.amount,
              dueDate: data.dueDate,
              status: "active",
              records,
            }
            return { ...acc, oneTimeDues: [...acc.oneTimeDues, newDues] }
          })
        )
        await backendAdapter.createOneTimeDues(accountId, data)
      })
    },
    [backendAdapter, runBusy, setAccounts]
  )

  const updateOneTimeDues = useCallback(
    async (accountId: string, duesId: string, data: UpdateOneTimeDuesInput) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          return {
            ...acc,
            oneTimeDues: acc.oneTimeDues.map((dues) =>
              dues.id === duesId ? { ...dues, title: data.title, amount: data.amount, dueDate: data.dueDate } : dues
            ),
          }
        })
      )
    },
    [setAccounts]
  )

  const closeOneTimeDues = useCallback(
    async (accountId: string, duesId: string, closed: boolean) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc
          return {
            ...acc,
            oneTimeDues: acc.oneTimeDues.map((dues) =>
              dues.id === duesId ? { ...dues, status: closed ? "closed" : "active" } : dues
            ),
          }
        })
      )
    },
    [setAccounts]
  )

  const deleteOneTimeDues = useCallback(
    async (accountId: string, duesId: string) => {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId
            ? { ...acc, oneTimeDues: acc.oneTimeDues.filter((dues) => dues.id !== duesId) }
            : acc
        )
      )
    },
    [setAccounts]
  )

  const toggleOneTimeDuesRecord = useCallback(
    async (accountId: string, duesId: string, memberId: string) => {
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id !== accountId) return acc
            return {
              ...acc,
              oneTimeDues: acc.oneTimeDues.map((dues) => {
                if (dues.id !== duesId) return dues
                if (dues.status === "closed") return dues
                return {
                  ...dues,
                  records: dues.records.map((record) => {
                    if (record.memberId !== memberId) return record
                    if (record.status === "unpaid") {
                      return { ...record, status: "paid" as const, paidDate: new Date().toISOString().split("T")[0] }
                    }
                    return { ...record, status: "unpaid" as const, paidDate: undefined }
                  }),
                }
              }),
            }
          })
        )
        await backendAdapter.toggleOneTimeDuesRecord(accountId, duesId, memberId)
      })
    },
    [backendAdapter, runBusy, setAccounts]
  )

  const createMember = useCallback(
    async (accountId: string, data: UpsertMemberInput) => {
      await runBusy(async () => {
        const remoteMember = await backendAdapter.createMember(accountId, data)
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id !== accountId) return acc
            const nextMember = remoteMember ?? createLocalMember(data, acc.members.length)
            const nextDues = acc.oneTimeDues.map((dues) => ({
              ...dues,
              records: [...dues.records, { memberId: nextMember.id, status: "unpaid" as const }],
            }))
            return {
              ...acc,
              members: normalizeMemberRoles([...acc.members, nextMember], nextMember.role === "총무" ? nextMember.id : undefined),
              duesRecords: [
                ...acc.duesRecords,
                {
                  memberId: nextMember.id,
                  month: new Date().toISOString().slice(0, 7),
                  status: "unpaid" as const,
                  amount: acc.monthlyDuesAmount,
                },
              ],
              oneTimeDues: nextDues,
            }
          })
        )
      })
    },
    [backendAdapter, runBusy, setAccounts]
  )

  const updateMember = useCallback(
    async (accountId: string, memberId: string, data: UpsertMemberInput) => {
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id !== accountId) return acc
            const nextMembers = acc.members.map((member) =>
              member.id === memberId
                ? { ...member, name: data.name, phone: data.phone, role: data.role, initials: buildMemberInitials(data.name) }
                : member
            )
            return { ...acc, members: normalizeMemberRoles(nextMembers, data.role === "총무" ? memberId : undefined) }
          })
        )
        await backendAdapter.updateMember(accountId, memberId, data)
      })
    },
    [backendAdapter, runBusy, setAccounts]
  )

  const delegateManager = useCallback(
    async (accountId: string, targetMemberId: string) => {
      await runBusy(async () => {
        const snapshot = accounts.find((account) => account.id === accountId)
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === accountId
              ? { ...acc, members: normalizeMemberRoles(acc.members, targetMemberId) }
              : acc
          )
        )
        const currentManager = snapshot?.members.find((member) => member.role === "총무")
        const targetMember = snapshot?.members.find((member) => member.id === targetMemberId)
        if (currentManager && currentManager.id !== targetMemberId) {
          await backendAdapter.updateMember(accountId, currentManager.id, {
            name: currentManager.name,
            phone: currentManager.phone,
            role: "멤버",
          })
        }
        if (targetMember) {
          await backendAdapter.updateMember(accountId, targetMember.id, {
            name: targetMember.name,
            phone: targetMember.phone,
            role: "총무",
          })
        }
      })
    },
    [accounts, backendAdapter, runBusy, setAccounts]
  )

  const deleteMember = useCallback(
    async (accountId: string, memberId: string) => {
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id !== accountId) return acc
            const nextMembers = acc.members.filter((member) => member.id !== memberId)
            return {
              ...acc,
              members: normalizeMemberRoles(nextMembers),
              duesRecords: acc.duesRecords.filter((record) => record.memberId !== memberId),
              oneTimeDues: acc.oneTimeDues.map((dues) => ({
                ...dues,
                records: dues.records.filter((record) => record.memberId !== memberId),
              })),
            }
          })
        )
        await backendAdapter.deleteMember(accountId, memberId)
      })
    },
    [backendAdapter, runBusy, setAccounts]
  )

  const createTransaction = useCallback(
    async (accountId: string, data: UpsertTransactionInput) => {
      await runBusy(async () => {
        const remoteTransaction = await backendAdapter.createTransaction(accountId, data)
        const nextTransaction = remoteTransaction ?? createLocalTransaction(data)
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id !== accountId) return acc
            return {
              ...acc,
              balance: acc.balance + getTransactionImpact(nextTransaction),
              transactions: sortTransactions([nextTransaction, ...acc.transactions]),
            }
          })
        )
      })
    },
    [backendAdapter, runBusy, setAccounts]
  )

  const updateTransaction = useCallback(
    async (accountId: string, transactionId: string, data: UpsertTransactionInput) => {
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id !== accountId) return acc
            const currentTransaction = acc.transactions.find((tx) => tx.id === transactionId)
            if (!currentTransaction) return acc
            const nextTransaction = { ...currentTransaction, ...data }
            return {
              ...acc,
              balance: acc.balance - getTransactionImpact(currentTransaction) + getTransactionImpact(nextTransaction),
              transactions: sortTransactions(acc.transactions.map((tx) => (tx.id === transactionId ? nextTransaction : tx))),
            }
          })
        )
        await backendAdapter.updateTransaction(accountId, transactionId, data)
      })
    },
    [backendAdapter, runBusy, setAccounts]
  )

  const deleteTransaction = useCallback(
    async (accountId: string, transactionId: string) => {
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id !== accountId) return acc
            const currentTransaction = acc.transactions.find((tx) => tx.id === transactionId)
            if (!currentTransaction) return acc
            return {
              ...acc,
              balance: acc.balance - getTransactionImpact(currentTransaction),
              transactions: acc.transactions.filter((tx) => tx.id !== transactionId),
            }
          })
        )
        await backendAdapter.deleteTransaction(accountId, transactionId)
      })
    },
    [backendAdapter, runBusy, setAccounts]
  )

  const sendReminder = useCallback(
    async (accountId: string, memberId: string, month: string, type: ReminderType) => {
      await runBusy(async () => {
        const account = accounts.find((item) => item.id === accountId)
        const member = account?.members.find((item) => item.id === memberId)
        if (!member) return
        const reminder = createReminder(memberId, month, type, member.name)
        const reminderNotification = createReminderNotification(member.name, month, type)
        setAccounts((prev) =>
          prev.map((item) => {
            if (item.id !== accountId) return item
            return { ...item, reminders: [reminder, ...item.reminders] }
          })
        )
        setNotifications((prev) => [reminderNotification, ...prev])
      })
    },
    [accounts, runBusy, setAccounts, setNotifications]
  )

  const sendPaymentReminder = useCallback(
    async (accountId: string, memberId: string, month: string) => sendReminder(accountId, memberId, month, "payment-reminder"),
    [sendReminder]
  )

  const sendTransferRequest = useCallback(
    async (accountId: string, memberId: string, month: string) => sendReminder(accountId, memberId, month, "transfer-request"),
    [sendReminder]
  )

  const createBoardPost = useCallback(
    async (accountId: string, data: CreateBoardPostInput) => {
      if (!currentUser) return
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === accountId
              ? {
                  ...account,
                  boardPosts: [
                    buildBoardPost(data, currentUser.id, currentUser.name),
                    ...account.boardPosts.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt)),
                  ],
                }
              : account
          )
        )
        setNotifications((prev) => [
          {
            id: `notice-${Date.now()}`,
            title: "게시판에 새 글이 등록됐어요",
            body: `${currentUser.name}님이 새 공지를 남겼습니다.`,
            time: "방금 전",
            unread: true,
          },
          ...prev,
        ])
      })
    },
    [currentUser, runBusy, setAccounts, setNotifications]
  )

  const addBoardComment = useCallback(
    async (accountId: string, postId: string, data: CreateBoardCommentInput) => {
      if (!currentUser || !data.body.trim()) return
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((account) => {
            if (account.id !== accountId) return account
            return {
              ...account,
              boardPosts: account.boardPosts.map((post) =>
                post.id === postId
                  ? { ...post, comments: [...post.comments, buildBoardComment(data, currentUser.id, currentUser.name)] }
                  : post
              ),
            }
          })
        )
      })
    },
    [currentUser, runBusy, setAccounts]
  )

  const updateBoardPost = useCallback(
    async (accountId: string, postId: string, data: UpdateBoardPostInput) => {
      if (!currentUser || !data.title.trim() || !data.body.trim()) return
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === accountId
              ? {
                  ...account,
                  boardPosts: account.boardPosts.map((post) =>
                    post.id === postId && post.authorUserId === currentUser.id
                      ? { ...post, title: data.title.trim(), body: data.body.trim(), pinned: data.pinned }
                      : post
                  ),
                }
              : account
          )
        )
      })
    },
    [currentUser, runBusy, setAccounts]
  )

  const deleteBoardPost = useCallback(
    async (accountId: string, postId: string) => {
      if (!currentUser) return
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === accountId
              ? {
                  ...account,
                  boardPosts: account.boardPosts.filter((post) => !(post.id === postId && post.authorUserId === currentUser.id)),
                }
              : account
          )
        )
      })
    },
    [currentUser, runBusy, setAccounts]
  )

  const updateBoardComment = useCallback(
    async (accountId: string, postId: string, commentId: string, data: UpdateBoardCommentInput) => {
      if (!currentUser || !data.body.trim()) return
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === accountId
              ? {
                  ...account,
                  boardPosts: account.boardPosts.map((post) =>
                    post.id === postId
                      ? {
                          ...post,
                          comments: post.comments.map((comment) =>
                            comment.id === commentId && comment.authorUserId === currentUser.id
                              ? { ...comment, body: data.body.trim() }
                              : comment
                          ),
                        }
                      : post
                  ),
                }
              : account
          )
        )
      })
    },
    [currentUser, runBusy, setAccounts]
  )

  const deleteBoardComment = useCallback(
    async (accountId: string, postId: string, commentId: string) => {
      if (!currentUser) return
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === accountId
              ? {
                  ...account,
                  boardPosts: account.boardPosts.map((post) =>
                    post.id === postId
                      ? {
                          ...post,
                          comments: post.comments.filter(
                            (comment) => !(comment.id === commentId && comment.authorUserId === currentUser.id)
                          ),
                        }
                      : post
                  ),
                }
              : account
          )
        )
      })
    },
    [currentUser, runBusy, setAccounts]
  )

  const toggleBoardPostLike = useCallback(
    async (accountId: string, postId: string) => {
      if (!currentUser) return
      await runBusy(async () => {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === accountId
              ? {
                  ...account,
                  boardPosts: account.boardPosts.map((post) => {
                    if (post.id !== postId) return post
                    const hasLiked = post.likedByUserIds.includes(currentUser.id)
                    return {
                      ...post,
                      likedByUserIds: hasLiked
                        ? post.likedByUserIds.filter((userId) => userId !== currentUser.id)
                        : [...post.likedByUserIds, currentUser.id],
                    }
                  }),
                }
              : account
          )
        )
      })
    },
    [currentUser, runBusy, setAccounts]
  )

  return {
    selectAccount,
    clearSelectedAccount,
    createAccount,
    deleteAccount,
    toggleDues,
    updateAutoTransfer,
    updateAccount,
    createOneTimeDues,
    updateOneTimeDues,
    closeOneTimeDues,
    deleteOneTimeDues,
    toggleOneTimeDuesRecord,
    createMember,
    updateMember,
    delegateManager,
    deleteMember,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    sendPaymentReminder,
    sendTransferRequest,
    createBoardPost,
    addBoardComment,
    updateBoardPost,
    deleteBoardPost,
    updateBoardComment,
    deleteBoardComment,
    toggleBoardPostLike,
  }
}
