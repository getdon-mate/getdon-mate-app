export const ROUTES = {
  Login: "Login",
  AccountList: "AccountList",
  AccountDetail: "AccountDetail",
  AccountCreate: "AccountCreate",
  MyPage: "MyPage",
  AppSettings: "AppSettings",
  NotificationList: "NotificationList",
  NotificationSettings: "NotificationSettings",
} as const

export type AppRouteName = (typeof ROUTES)[keyof typeof ROUTES]
