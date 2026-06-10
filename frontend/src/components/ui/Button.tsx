import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'primary' | 'secondary'
}

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition'
  const variants = {
    primary: 'bg-[linear-gradient(135deg,#0b57a4,#073a6a)] text-white shadow-lg shadow-unefa/20 hover:brightness-110',
    secondary: 'bg-white/90 text-unefa ring-1 ring-inset ring-unefa/15 hover:bg-unefa/5 hover:text-unefa-dark',
  }

  return <button className={`${base} ${variants[variant]} ${className}`.trim()} {...props} />
}
