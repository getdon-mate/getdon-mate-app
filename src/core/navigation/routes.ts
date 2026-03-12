export const ROUTES = {
  Login: "Login",
  AccountList: "AccountList",
  AccountDetail: "AccountDetail",
  AccountCreate: "AccountCreate",
  MyPage: "MyPage",
  NotificationSettings: "NotificationSettings",
} as const

export type AppRouteName = (typeof ROUTES)[keyof typeof ROUTES]
