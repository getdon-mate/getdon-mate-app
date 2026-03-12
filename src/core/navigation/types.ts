import { ROUTES } from "./routes"

export type RootStackParamList = {
  [ROUTES.Login]: undefined
  [ROUTES.AccountList]: undefined
  [ROUTES.AccountDetail]: { accountId?: string } | undefined
  [ROUTES.AccountCreate]: undefined
  [ROUTES.MyPage]: undefined
  [ROUTES.NotificationSettings]: undefined
}
