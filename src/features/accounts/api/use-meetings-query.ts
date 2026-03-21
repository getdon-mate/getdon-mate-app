import { useMutation, useQuery } from "@tanstack/react-query"
import { meetingKeys } from "@core/api/query-keys"
import {
  fetchMyMeetings,
  createMeeting,
  type CreateMeetingRequest,
} from "./meetings-api"

export function useMeetingsQuery(accessToken: string | undefined) {
  return useQuery({
    queryKey: meetingKeys.list(accessToken ?? ""),
    queryFn: () => fetchMyMeetings(accessToken!),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  })
}

export function useCreateMeetingMutation(accessToken: string | undefined) {
  return useMutation({
    mutationFn: (req: CreateMeetingRequest) => createMeeting(accessToken!, req),
  })
}
