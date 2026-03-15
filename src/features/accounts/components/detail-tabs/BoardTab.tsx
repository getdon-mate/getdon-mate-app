import { useMemo, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useApp, useAppAuth } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { formatDate } from "@shared/lib/format"
import { requireText } from "@shared/lib/validation"
import { Button, InputField, ToggleSwitch, uiColors } from "@shared/ui"
import type { GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { SectionCard } from "../SectionCard"
import { SectionHeader } from "../SectionHeader"

export function BoardTab({ account }: { account: GroupAccount }) {
  const { currentUser } = useAppAuth()
  const { createBoardPost, addBoardComment } = useApp()
  const { showAlert, showToast } = useFeedback()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [pinned, setPinned] = useState(false)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  const sortedPosts = useMemo(
    () => [...account.boardPosts].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt)),
    [account.boardPosts]
  )

  async function handleCreatePost() {
    const error = requireText(title, "제목을 입력해주세요.") ?? requireText(body, "내용을 입력해주세요.")
    if (error) {
      showAlert({ title: "입력 오류", message: error, tone: "danger" })
      return
    }

    await createBoardPost(account.id, { title, body, pinned })
    setTitle("")
    setBody("")
    setPinned(false)
    showToast({ tone: "success", title: "게시 완료", message: "게시판에 새 글을 올렸습니다." })
  }

  async function handleAddComment(postId: string) {
    const draft = commentDrafts[postId] ?? ""
    const error = requireText(draft, "댓글 내용을 입력해주세요.")
    if (error) {
      showAlert({ title: "입력 오류", message: error, tone: "danger" })
      return
    }

    await addBoardComment(account.id, postId, { body: draft })
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }))
    showToast({ tone: "success", title: "댓글 등록", message: "댓글을 남겼습니다." })
  }

  return (
    <View style={styles.stack}>
      <SectionCard>
        <SectionHeader title="공지 작성" description="운영 메모와 공지를 바로 남깁니다." />
        <View style={styles.formStack}>
          <InputField
            value={title}
            onChangeText={setTitle}
            label="제목"
            placeholder="예: 이번 주 모임 장소 안내"
            containerStyle={styles.compactField}
            inputStyle={styles.compactInput}
          />
          <InputField
            value={body}
            onChangeText={setBody}
            label="내용"
            placeholder="공지나 운영 메모를 남겨보세요."
            multiline
            containerStyle={styles.compactField}
            inputStyle={[styles.compactInput, styles.bodyInput]}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>상단 고정</Text>
            <ToggleSwitch value={pinned} onPress={() => setPinned((prev) => !prev)} />
          </View>
          <Button
            label={currentUser ? "게시하기" : "로그인 후 게시"}
            onPress={() => void handleCreatePost()}
            disabled={!currentUser}
            style={styles.submitButton}
          />
        </View>
      </SectionCard>

      {sortedPosts.length > 0 ? (
        sortedPosts.map((post) => (
          <SectionCard key={post.id}>
            <View style={styles.postHeader}>
              <View style={styles.postTitleWrap}>
                <Text style={styles.postTitle}>{post.pinned ? `[공지] ${post.title}` : post.title}</Text>
                <Text style={styles.postMeta}>
                  {post.authorName} · {formatDate(post.createdAt.slice(0, 10))}
                </Text>
              </View>
            </View>
            <Text style={styles.postBody}>{post.body}</Text>
            <View style={styles.commentList}>
              {post.comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                  <Text style={styles.commentBody}>{comment.body}</Text>
                </View>
              ))}
            </View>
            <View style={styles.commentComposer}>
              <InputField
                value={commentDrafts[post.id] ?? ""}
                onChangeText={(value) => setCommentDrafts((prev) => ({ ...prev, [post.id]: value }))}
                label="댓글"
                placeholder="댓글을 남겨보세요."
                containerStyle={styles.compactField}
                inputStyle={styles.compactInput}
              />
              <Button label="댓글 등록" variant="ghost" onPress={() => void handleAddComment(post.id)} style={styles.commentButton} />
            </View>
          </SectionCard>
        ))
      ) : (
        <EmptyStateCard title="첫 공지를 남겨보세요." description="모임 공지와 운영 메모를 한 곳에서 공유할 수 있습니다." />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  formStack: {
    gap: 8,
    marginTop: 10,
  },
  compactField: {
    gap: 4,
  },
  compactInput: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  bodyInput: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    color: uiColors.textStrong,
    fontSize: 12,
    fontWeight: "700",
  },
  submitButton: {
    minHeight: 42,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  postTitleWrap: {
    gap: 4,
    flex: 1,
  },
  postTitle: {
    color: uiColors.textStrong,
    fontSize: 16,
    fontWeight: "800",
  },
  postMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  postBody: {
    marginTop: 10,
    color: uiColors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  commentList: {
    gap: 8,
    marginTop: 12,
  },
  commentCard: {
    borderRadius: 12,
    backgroundColor: uiColors.surfaceMuted,
    padding: 12,
    gap: 4,
  },
  commentAuthor: {
    color: uiColors.textStrong,
    fontSize: 12,
    fontWeight: "700",
  },
  commentBody: {
    color: uiColors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  commentComposer: {
    gap: 6,
    marginTop: 12,
  },
  commentButton: {
    minHeight: 40,
  },
})
