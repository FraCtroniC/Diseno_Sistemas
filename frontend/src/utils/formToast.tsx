import toast from 'react-hot-toast'

type ErrorBag = Record<string, string | { message?: string } | undefined>

/**
 * Muestra un toast con el resumen de errores de validación de un formulario.
 * Acepta tanto errores de react-hook-form ({ message }) como mensajes en texto plano.
 */
export function toastFieldErrors(errors: ErrorBag, labels: Record<string, string> = {}) {
  const items = Object.entries(errors)
    .map(([field, error]) => ({ field, message: typeof error === 'string' ? error : error?.message }))
    .filter((item): item is { field: string; message: string } => Boolean(item.message))

  if (!items.length) return

  toast.error(
    <span className="flex flex-col gap-1">
      <span className="font-semibold">
        {items.length === 1 ? 'Hay 1 error en el formulario' : `Hay ${items.length} errores en el formulario`}
      </span>
      {items.map(({ field, message }) => (
        <span key={field}>• {labels[field] ?? field}: {message}</span>
      ))}
    </span>,
  )
}
