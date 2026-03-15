import { useMemo, useState } from "react"
import { Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native"
import { useApp, useAppAuth } from "@core/providers/AppProvider"
import { useFeedback } from "@core/providers/FeedbackProvider"
import { copyText } from "@shared/lib/clipboard"
import { formatActivityTimestamp } from "@shared/lib/format"
import { requireText } from "@shared/lib/validation"
import { ActionChip, Button, Icon, InputField, ToggleSwitch, uiColors, uiRadius } from "@shared/ui"
import type { BoardComment, BoardPost, GroupAccount } from "../../model/types"
import { EmptyStateCard } from "../EmptyStateCard"
import { LoadingStateCard } from "../LoadingStateCard"
import { SectionCard } from "../SectionCard"
import { SectionHeader } from "../SectionHeader"

const boardTemplates = [
  {
    label: "회비 안내",
    title: "이번 달 회비 안내",
    body: "마감일 전까지 회비를 확인해주세요. 필요한 내용은 댓글로 남겨주세요.",
    pinned: true,
  },
  {
    label: "장소 변경",
    title: "모임 장소 변경 안내",
    body: "이번 모임 장소가 변경됐습니다. 상세 위치는 본문에 바로 업데이트했습니다.",
    pinned: true,
  },
  {
    label: "정산 공유",
    title: "이번 주 정산 공유",
    body: "지출과 잔액을 정리했습니다. 확인 후 필요한 의견을 댓글로 남겨주세요.",
    pinned: false,
  },
] as const

function getProfileMeta(account: GroupAccount, authorName: string, authorUserId?: string) {
  const member = account.members.find((item) => item.userId === authorUserId || item.name === authorName)
  const initials = member?.initials ?? authorName.slice(0, 1)
  return {
    initials,
    color: member?.color ?? uiColors.primarySoft,
    textColor: member ? uiColors.surface : uiColors.primary,
  }
}

function CommentItem({
  account,
  comment,
  ownComment,
  showDivider,
  draft,
  isEditing,
  isMutating,
  onChangeDraft,
  onStartEdit,
  onCancelEdit,
  onSubmit,
  onDelete,
}: {
  account: GroupAccount
  comment: BoardComment
  ownComment: boolean
  showDivider: boolean
  draft: string
  isEditing: boolean
  isMutating: boolean
  onChangeDraft: (value: string) => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onSubmit: () => void
  onDelete: () => void
}) {
  const profile = getProfileMeta(account, comment.authorName, comment.authorUserId)

  return (
    <View style={[styles.commentRow, showDivider && styles.commentRowWithDivider]} testID={showDivider ? `comment-divider-${comment.id}` : undefined}>
      <View testID={`comment-avatar-${comment.id}`} style={[styles.commentAvatar, { backgroundColor: profile.color }]}>
        <Text style={[styles.commentAvatarText, { color: profile.textColor }]}>{profile.initials}</Text>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentTopRow}>
          <View style={styles.commentMetaStack}>
            <Text style={styles.commentAuthor}>{comment.authorName}</Text>
            <Text style={styles.commentTime}>{formatActivityTimestamp(comment.createdAt)}</Text>
          </View>
          {ownComment ? (
            <View style={styles.inlineActions}>
              <Pressable onPress={onStartEdit} accessibilityRole="button" accessibilityLabel={`${comment.authorName} 댓글 수정`} style={styles.inlineIconButton}>
                <Icon name="edit" size={14} color={uiColors.textMuted} />
              </Pressable>
              <Pressable onPress={onDelete} accessibilityRole="button" accessibilityLabel={`${comment.authorName} 댓글 삭제`} style={styles.inlineIconButton}>
                <Icon name="trash" size={14} color={uiColors.danger} />
              </Pressable>
            </View>
          ) : null}
        </View>
        {isEditing ? (
          <CommentComposer
            value={draft}
            onChangeText={onChangeDraft}
            placeholder="댓글을 정리해보세요."
            isEditing
            isMutating={isMutating}
            onCancel={onCancelEdit}
            onSubmit={onSubmit}
          />
        ) : (
          <Text style={styles.commentBody}>{comment.body}</Text>
        )}
      </View>
    </View>
  )
}

function CommentComposer({
  value,
  placeholder,
  isEditing,
  isMutating,
  onChangeText,
  onCancel,
  onSubmit,
}: {
  value: string
  placeholder: string
  isEditing: boolean
  isMutating: boolean
  onChangeText: (value: string) => void
  onCancel?: () => void
  onSubmit: () => void
}) {
  return (
    <View style={styles.commentComposer}>
      <Text style={styles.commentComposerLabel}>{isEditing ? "댓글 수정" : "댓글"}</Text>
      <View style={styles.commentComposerRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          accessibilityLabel={isEditing ? "댓글 수정" : "댓글"}
          placeholder={placeholder}
          placeholderTextColor={uiColors.textSoft}
          style={styles.commentComposerInput}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="댓글 전송"
          disabled={!value.trim() || isMutating}
          onPress={onSubmit}
          style={[styles.commentSendButton, (!value.trim() || isMutating) && styles.commentSendButtonDisabled]}
        >
          <Icon name="send" size={16} color={!value.trim() || isMutating ? uiColors.textSoft : uiColors.primary} />
        </Pressable>
      </View>
      {isEditing && onCancel ? (
        <Pressable accessibilityRole="button" accessibilityLabel="댓글 수정 취소" onPress={onCancel} style={styles.commentCancelButton}>
          <Text style={styles.commentCancelText}>취소</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

function PostCard({
  account,
  post,
  currentUserId,
  isMutating,
  commentDraft,
  editingCommentId,
  onChangeCommentDraft,
  onSubmitComment,
  onStartEditPost,
  onDeletePost,
  onToggleLike,
  onCopyLink,
  onSharePost,
  onStartEditComment,
  onCancelEditComment,
  onDeleteComment,
}: {
  account: GroupAccount
  post: BoardPost
  currentUserId: string | null
  isMutating: boolean
  commentDraft: string
  editingCommentId: string | null
  onChangeCommentDraft: (value: string) => void
  onSubmitComment: () => void
  onStartEditPost: () => void
  onDeletePost: () => void
  onToggleLike: () => void
  onCopyLink: () => void
  onSharePost: () => void
  onStartEditComment: (comment: BoardComment) => void
  onCancelEditComment: () => void
  onDeleteComment: (commentId: string) => void
}) {
  const ownPost = post.authorUserId != null && post.authorUserId === currentUserId
  const profile = getProfileMeta(account, post.authorName, post.authorUserId)
  const [menuOpen, setMenuOpen] = useState(false)
  const liked = currentUserId != null && post.likedByUserIds.includes(currentUserId)

  return (
    <SectionCard key={post.id}>
      <View style={styles.postHeader}>
        <View style={styles.postIdentity}>
          <View style={[styles.postAvatar, { backgroundColor: profile.color }]}>
            <Text style={[styles.postAvatarText, { color: profile.textColor }]}>{profile.initials}</Text>
          </View>
          <View style={styles.postTitleWrap}>
            <View style={styles.postTitleRow}>
              {post.pinned ? <Text style={styles.noticeBadge}>공지</Text> : null}
              <Text style={styles.postTitle}>{post.title}</Text>
            </View>
            <Text style={styles.postMeta}>
              {post.authorName} · {formatActivityTimestamp(post.createdAt)}
            </Text>
          </View>
        </View>
        {ownPost ? (
          <View style={styles.postMenuWrap}>
            <Pressable
              onPress={() => setMenuOpen((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={`${post.title} 게시글 메뉴 열기`}
              style={[styles.inlineIconButton, menuOpen && styles.inlineIconButtonActive]}
            >
              <Icon name="ellipsis" size={15} color={uiColors.textStrong} />
            </Pressable>
            {menuOpen ? (
              <View style={styles.postMenuPanel}>
                <Pressable
                  onPress={() => {
                    setMenuOpen(false)
                    onStartEditPost()
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${post.title} 게시글 수정`}
                  style={styles.postMenuItem}
                >
                  <Icon name="edit" size={14} color={uiColors.textStrong} />
                  <Text style={styles.postMenuText}>수정</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setMenuOpen(false)
                    onDeletePost()
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${post.title} 게시글 삭제`}
                  style={[styles.postMenuItem, styles.postMenuItemDanger]}
                >
                  <Icon name="trash" size={14} color={uiColors.danger} />
                  <Text style={styles.postMenuTextDanger}>삭제</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.postBodyPanel}>
        <Text style={styles.postBody}>{post.body}</Text>
      </View>

      <View style={styles.postActionsRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="게시글 좋아요" onPress={onToggleLike} style={styles.postActionChip}>
          <Icon name={liked ? "heart" : "heartOutline"} size={15} color={liked ? uiColors.danger : uiColors.textStrong} />
          <Text style={[styles.postActionText, liked && styles.postActionTextActive]}>좋아요 {post.likedByUserIds.length}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="게시글 링크 복사" onPress={onCopyLink} style={styles.postActionChip}>
          <Icon name="copy" size={15} color={uiColors.textStrong} />
          <Text style={styles.postActionText}>링크 복사</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="게시글 공유" onPress={onSharePost} style={styles.postActionChip}>
          <Icon name="share" size={15} color={uiColors.textStrong} />
          <Text style={styles.postActionText}>공유</Text>
        </Pressable>
      </View>

      <View style={styles.commentList}>
        {post.comments.map((comment, index) => (
          <CommentItem
            key={comment.id}
            account={account}
            comment={comment}
            ownComment={comment.authorUserId != null && comment.authorUserId === currentUserId}
            showDivider={index > 0}
            draft={commentDraft}
            isEditing={editingCommentId === comment.id}
            isMutating={isMutating}
            onChangeDraft={onChangeCommentDraft}
            onStartEdit={() => onStartEditComment(comment)}
            onCancelEdit={onCancelEditComment}
            onSubmit={onSubmitComment}
            onDelete={() => onDeleteComment(comment.id)}
          />
        ))}
      </View>

      <CommentComposer
        value={commentDraft}
        onChangeText={onChangeCommentDraft}
        placeholder={editingCommentId ? "댓글을 정리해보세요." : "댓글을 남겨보세요."}
        isEditing={editingCommentId !== null}
        isMutating={isMutating}
        onCancel={editingCommentId ? onCancelEditComment : undefined}
        onSubmit={onSubmitComment}
      />
    </SectionCard>
  )
}

export function BoardTab({ account }: { account: GroupAccount }) {
  const { currentUser } = useAppAuth()
  const { createBoardPost, addBoardComment, updateBoardPost, deleteBoardPost, updateBoardComment, deleteBoardComment, toggleBoardPostLike, isMutating } =
    useApp()
  const { showAlert, showToast, confirmDanger } = useFeedback()
  const [composerOpen, setComposerOpen] = useState(account.boardPosts.length === 0)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [pinned, setPinned] = useState(false)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [editingCommentIds, setEditingCommentIds] = useState<Record<string, string | null>>({})

  const sortedPosts = useMemo(
    () => [...account.boardPosts].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt)),
    [account.boardPosts]
  )
  const pinnedPosts = sortedPosts.filter((post) => post.pinned)
  const recentPosts = sortedPosts.filter((post) => !post.pinned)
  const isEditingPost = editingPostId !== null

  function resetComposer() {
    setEditingPostId(null)
    setTitle("")
    setBody("")
    setPinned(false)
  }

  function applyTemplate(template: (typeof boardTemplates)[number]) {
    setComposerOpen(true)
    setTitle(template.title)
    setBody(template.body)
    setPinned(template.pinned)
  }

  function buildPostShareLink(post: BoardPost) {
    return `https://getdon-mate.app/accounts/${account.id}/board/${post.id}`
  }

  async function handleCreateOrUpdatePost() {
    const error = requireText(title, "제목을 입력해주세요.") ?? requireText(body, "내용을 입력해주세요.")
    if (error) {
      showAlert({ title: "입력 오류", message: error, tone: "danger" })
      return
    }

    if (editingPostId) {
      await updateBoardPost(account.id, editingPostId, { title, body, pinned })
      showToast({ tone: "success", title: "수정 완료", message: "게시글을 수정했습니다." })
      resetComposer()
      setComposerOpen(false)
      return
    }

    await createBoardPost(account.id, { title, body, pinned })
    resetComposer()
    setComposerOpen(false)
    showToast({ tone: "success", title: "게시 완료", message: "게시판에 새 글을 올렸습니다." })
  }

  async function handleDeletePost(post: BoardPost) {
    const confirmed = await confirmDanger({
      title: "게시글 삭제",
      message: "게시글과 댓글이 함께 삭제됩니다.",
      confirmLabel: "삭제",
    })
    if (!confirmed) return

    await deleteBoardPost(account.id, post.id)
    if (editingPostId === post.id) {
      resetComposer()
      setComposerOpen(false)
    }
    showToast({ tone: "success", title: "삭제 완료", message: "게시글을 삭제했습니다." })
  }

  function handleStartEditPost(post: BoardPost) {
    setComposerOpen(true)
    setEditingPostId(post.id)
    setTitle(post.title)
    setBody(post.body)
    setPinned(post.pinned)
  }

  function handleStartEditComment(postId: string, comment: BoardComment) {
    setEditingCommentIds((prev) => ({ ...prev, [postId]: comment.id }))
    setCommentDrafts((prev) => ({ ...prev, [postId]: comment.body }))
  }

  function handleCancelEditComment(postId: string) {
    setEditingCommentIds((prev) => ({ ...prev, [postId]: null }))
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }))
  }

  async function handleSubmitComment(postId: string) {
    const draft = commentDrafts[postId] ?? ""
    const editingCommentId = editingCommentIds[postId] ?? null
    const error = requireText(draft, "댓글 내용을 입력해주세요.")
    if (error) {
      showAlert({ title: "입력 오류", message: error, tone: "danger" })
      return
    }

    if (editingCommentId) {
      await updateBoardComment(account.id, postId, editingCommentId, { body: draft })
      handleCancelEditComment(postId)
      showToast({ tone: "success", title: "수정 완료", message: "댓글을 수정했습니다." })
      return
    }

    await addBoardComment(account.id, postId, { body: draft })
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }))
    showToast({ tone: "success", title: "댓글 등록", message: "댓글을 남겼습니다." })
  }

  async function handleDeleteComment(postId: string, commentId: string) {
    const confirmed = await confirmDanger({
      title: "댓글 삭제",
      message: "삭제한 댓글은 되돌릴 수 없습니다.",
      confirmLabel: "삭제",
    })
    if (!confirmed) return

    await deleteBoardComment(account.id, postId, commentId)
    if ((editingCommentIds[postId] ?? null) === commentId) {
      handleCancelEditComment(postId)
    }
    showToast({ tone: "success", title: "삭제 완료", message: "댓글을 삭제했습니다." })
  }

  async function handleToggleLike(post: BoardPost) {
    await toggleBoardPostLike(account.id, post.id)
  }

  async function handleCopyPostLink(post: BoardPost) {
    const copied = await copyText(buildPostShareLink(post))
    if (!copied) {
      showAlert({ title: "복사 실패", message: "링크를 복사하지 못했습니다.", tone: "danger" })
      return
    }

    showToast({ tone: "success", title: "링크 복사", message: "게시글 링크를 복사했어요." })
  }

  async function handleSharePost(post: BoardPost) {
    await Share.share({
      message: `${post.title}\n${buildPostShareLink(post)}`,
      url: buildPostShareLink(post),
      title: post.title,
    })
    showToast({ tone: "success", title: "공유 준비", message: "공유할 내용을 열었습니다." })
  }

  return (
    <View style={styles.stack}>
      <SectionCard>
        <SectionHeader
          title="게시판"
          description="공지와 운영 메모를 정리합니다."
          actionLabel={composerOpen ? "닫기" : "게시글 작성"}
          onAction={() => {
            if (composerOpen) {
              resetComposer()
              setComposerOpen(false)
              return
            }
            setComposerOpen(true)
          }}
        />
        {composerOpen ? (
          <View style={styles.formStack}>
            <View style={styles.templateRow}>
              {boardTemplates.map((template) => (
                <ActionChip key={template.label} label={template.label} onPress={() => applyTemplate(template)} />
              ))}
            </View>
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
            <View style={styles.composerActions}>
              {isEditingPost ? <Button label="취소" variant="ghost" onPress={() => { resetComposer(); setComposerOpen(false) }} style={styles.commentSecondaryButton} /> : null}
              <Button
                label={!currentUser ? "로그인 후 게시" : isMutating ? "게시 중..." : isEditingPost ? "수정 저장" : "게시하기"}
                onPress={() => void handleCreateOrUpdatePost()}
                disabled={!currentUser || !title.trim() || !body.trim() || isMutating}
                style={styles.submitButton}
              />
            </View>
          </View>
        ) : null}
      </SectionCard>

      {sortedPosts.length > 0 ? (
        <>
          {pinnedPosts.length > 0 ? <Text style={styles.sectionLabel}>고정 공지</Text> : null}
          {pinnedPosts.map((post) => (
            <PostCard
              key={post.id}
              account={account}
              post={post}
              currentUserId={currentUser?.id ?? null}
              isMutating={isMutating}
              commentDraft={commentDrafts[post.id] ?? ""}
              editingCommentId={editingCommentIds[post.id] ?? null}
              onChangeCommentDraft={(value) => setCommentDrafts((prev) => ({ ...prev, [post.id]: value }))}
              onSubmitComment={() => void handleSubmitComment(post.id)}
              onStartEditPost={() => handleStartEditPost(post)}
              onDeletePost={() => void handleDeletePost(post)}
              onToggleLike={() => void handleToggleLike(post)}
              onCopyLink={() => void handleCopyPostLink(post)}
              onSharePost={() => void handleSharePost(post)}
              onStartEditComment={(comment) => handleStartEditComment(post.id, comment)}
              onCancelEditComment={() => handleCancelEditComment(post.id)}
              onDeleteComment={(commentId) => void handleDeleteComment(post.id, commentId)}
            />
          ))}
          {recentPosts.length > 0 ? <Text style={styles.sectionLabel}>최근 글</Text> : null}
          {recentPosts.map((post) => (
            <PostCard
              key={post.id}
              account={account}
              post={post}
              currentUserId={currentUser?.id ?? null}
              isMutating={isMutating}
              commentDraft={commentDrafts[post.id] ?? ""}
              editingCommentId={editingCommentIds[post.id] ?? null}
              onChangeCommentDraft={(value) => setCommentDrafts((prev) => ({ ...prev, [post.id]: value }))}
              onSubmitComment={() => void handleSubmitComment(post.id)}
              onStartEditPost={() => handleStartEditPost(post)}
              onDeletePost={() => void handleDeletePost(post)}
              onToggleLike={() => void handleToggleLike(post)}
              onCopyLink={() => void handleCopyPostLink(post)}
              onSharePost={() => void handleSharePost(post)}
              onStartEditComment={(comment) => handleStartEditComment(post.id, comment)}
              onCancelEditComment={() => handleCancelEditComment(post.id)}
              onDeleteComment={(commentId) => void handleDeleteComment(post.id, commentId)}
            />
          ))}
        </>
      ) : isMutating ? (
        <>
          <LoadingStateCard lines={3} />
          <LoadingStateCard lines={2} />
        </>
      ) : (
        <EmptyStateCard title="첫 공지를 남겨보세요." description="운영 소식은 짧게 바로 올릴 수 있습니다." actionLabel="게시글 작성" onAction={() => setComposerOpen(true)} />
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
  templateRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
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
  composerActions: {
    flexDirection: "row",
    gap: 8,
  },
  submitButton: {
    flex: 1,
    minHeight: 42,
  },
  sectionLabel: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 4,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  postIdentity: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  postAvatarText: {
    fontSize: 12,
    fontWeight: "800",
  },
  postTitleWrap: {
    gap: 4,
    flex: 1,
  },
  postTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  noticeBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
    color: uiColors.primary,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: "hidden",
  },
  postTitle: {
    color: uiColors.textStrong,
    fontSize: 16,
    fontWeight: "800",
    flexShrink: 1,
  },
  postMeta: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  postBodyPanel: {
    marginTop: 12,
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  postBody: {
    color: uiColors.textStrong,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "500",
  },
  inlineActions: {
    flexDirection: "row",
    gap: 6,
  },
  inlineIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineIconButtonActive: {
    borderColor: uiColors.primaryBorder,
    backgroundColor: uiColors.primarySoft,
  },
  postMenuWrap: {
    position: "relative",
  },
  postMenuPanel: {
    position: "absolute",
    top: 34,
    right: 0,
    minWidth: 104,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    overflow: "hidden",
    zIndex: 20,
  },
  postMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  postMenuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: uiColors.border,
  },
  postMenuText: {
    color: uiColors.textStrong,
    fontSize: 13,
    fontWeight: "700",
  },
  postMenuTextDanger: {
    color: uiColors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
  commentList: {
    marginTop: 12,
  },
  postActionsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 10,
  },
  postActionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  postActionText: {
    color: uiColors.textStrong,
    fontSize: 12,
    fontWeight: "700",
  },
  postActionTextActive: {
    color: uiColors.danger,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12,
  },
  commentRowWithDivider: {
    borderTopWidth: 1,
    borderTopColor: uiColors.border,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    fontSize: 11,
    fontWeight: "800",
  },
  commentContent: {
    flex: 1,
    gap: 6,
  },
  commentTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  commentMetaStack: {
    gap: 2,
    flex: 1,
  },
  commentAuthor: {
    color: uiColors.textStrong,
    fontSize: 13,
    fontWeight: "700",
  },
  commentTime: {
    color: uiColors.textSoft,
    fontSize: 11,
    fontWeight: "600",
  },
  commentBody: {
    color: uiColors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  commentComposerLabel: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  commentComposer: {
    gap: 8,
    marginTop: 10,
  },
  commentComposerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: uiColors.border,
    borderRadius: uiRadius.md,
    backgroundColor: uiColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  commentComposerInput: {
    flex: 1,
    minHeight: 36,
    fontSize: 14,
    color: uiColors.textStrong,
    paddingVertical: 6,
  },
  commentSendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.primarySoft,
  },
  commentSendButtonDisabled: {
    backgroundColor: uiColors.surfaceMuted,
  },
  commentCancelButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 2,
  },
  commentCancelText: {
    color: uiColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  commentComposerActions: {
    flexDirection: "row",
    gap: 8,
  },
  commentEditStack: {
    gap: 8,
  },
  commentEditActions: {
    flexDirection: "row",
    gap: 8,
  },
  commentPrimaryButton: {
    flex: 1,
  },
  commentSecondaryButton: {
    flex: 1,
  },
})
