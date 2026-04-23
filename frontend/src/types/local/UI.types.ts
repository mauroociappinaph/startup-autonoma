import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { badgeVariants } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
