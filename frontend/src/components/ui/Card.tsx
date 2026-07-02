import type { PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<{ className?: string }>

export default function Card({ className = '', children }: CardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(11,87,164,0.32)] backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/90 dark:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.5)] ${className}`.trim()}>
      {children}
    </div>
  )
}
