import type { ReactNode } from "react"
import { Card } from "@shared/ui"

export function SectionCard({ children }: { children: ReactNode }) {
  return <Card>{children}</Card>
}
