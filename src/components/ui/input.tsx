import * as React from "react"

import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<"input"> & {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
  rightIconClickable?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ containerClassName, className, type, leftIcon, rightIcon, rightIconClickable = false, ...props }, ref) => {
    const inputElement = (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-[#AFAFAF]",
          leftIcon && "pl-9",
          rightIcon && "pr-9",
          className
        )}
        {...props}
      />
    )

    if (!leftIcon && !rightIcon) {
      return inputElement
    }

    return (
      <div className={cn("relative w-full", containerClassName)}>
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-muted-foreground">
            {leftIcon}
          </span>
        )}
        {inputElement}
        {rightIcon && (
          <span className={cn(
            "absolute inset-y-0 right-2 flex items-center text-muted-foreground",
            !rightIconClickable && "pointer-events-none"
          )}>
            {rightIcon}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, type InputProps }
