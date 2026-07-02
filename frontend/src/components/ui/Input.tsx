import { forwardRef, type InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className = '', ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl border border-slate-300/90 bg-white/90 px-4 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-unefa focus:ring-2 focus:ring-unefa/20 dark:border-slate-600/80 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500 ${className}`.trim()}
        {...props}
      />
    )
  }
)

export default Input
