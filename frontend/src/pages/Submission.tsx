import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { toastFieldErrors } from '../utils/formToast'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { trabajoService, categoriaService, type Categoria, type Trabajo } from '../services/trabajoService'
import { useAuthStore } from '../stores/useAuthStore'
import { TIPOS_DOCUMENTO } from '../types'

type Step = 1 | 2

type FormState = {
  title: string
  authors: string
  tutor: string
  year: string
  documentType: string
  program: string
  categoryId: string
  description: string
  keywords: string
  publicationState: 'draft' | 'published' | 'archived'
  file: File | null
}

type FormErrors = Partial<Record<keyof FormState, string>>

const initialState: FormState = {
  title: '',
  authors: '',
  tutor: '',
  year: '',
  documentType: '',
  program: '',
  categoryId: '',
  description: '',
  keywords: '',
  publicationState: 'draft',
  file: null,
}

const STEP_ONE_FIELDS: (keyof FormState)[] = ['title', 'authors', 'tutor', 'year', 'program', 'categoryId', 'keywords']
const STEP_TWO_FIELDS: (keyof FormState)[] = ['description', 'file']
const FIELD_ORDER: (keyof FormState)[] = [
  'title', 'authors', 'tutor', 'year', 'program', 'documentType', 'categoryId',
  'keywords', 'description', 'file', 'publicationState',
]

const FIELD_LABELS: Record<keyof FormState, string> = {
  title: 'Título',
  authors: 'Autores',
  tutor: 'Tutor / asesor',
  year: 'Año',
  documentType: 'Tipo de documento',
  program: 'Programa académico',
  categoryId: 'Categoría',
  description: 'Resumen / descripción',
  keywords: 'Palabras clave',
  file: 'Archivo PDF',
  publicationState: 'Estado de publicación',
}

const ESTADO_LABELS: Record<Trabajo['estado'], string> = {
  borrador: 'Borrador',
  en_revision: 'En revisión',
  publicado: 'Publicado',
  archivado: 'Archivado',
}

/** Convierte "palabra uno, palabra dos" en un arreglo limpio. */
function parseKeywords(value: string): string[] {
  return value.split(',').map((keyword) => keyword.trim()).filter(Boolean)
}

/** Devuelve los metadatos como objeto plano seguro. */
function metadatosRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function validateField(field: keyof FormState, state: FormState, isEdit = false): string | undefined {
  switch (field) {
    case 'title':
      if (!state.title.trim()) return 'El título es obligatorio.'
      if (state.title.trim().length > 300) return 'El título no puede exceder 300 caracteres.'
      return undefined
    case 'authors':
      if (!state.authors.trim()) return 'Agrega al menos un autor.'
      if (state.authors.trim().length > 200) return 'Los autores no pueden exceder 200 caracteres.'
      return undefined
    case 'tutor':
      if (state.tutor.trim().length > 200) return 'El tutor no puede exceder 200 caracteres.'
      return undefined
    case 'year': {
      const year = state.year.trim()
      if (!year) return 'El año es obligatorio.'
      if (Number.isNaN(Number(year))) return 'El año debe ser numérico.'
      if (Number(year) < 1900 || Number(year) > 2100) return 'El año debe estar entre 1900 y 2100.'
      return undefined
    }
    case 'program':
      return state.program.trim() ? undefined : 'Indica el programa académico.'
    case 'categoryId':
      return state.categoryId ? undefined : 'Selecciona una categoría.'
    case 'keywords': {
      const keywords = parseKeywords(state.keywords)
      if (keywords.length > 15) return 'Máximo 15 palabras clave.'
      if (keywords.some((keyword) => keyword.length > 100)) return 'Cada palabra clave no puede exceder 100 caracteres.'
      return undefined
    }
    case 'description':
      return state.description.trim() ? undefined : 'Describe brevemente el documento.'
    case 'file':
      // En modo edición el PDF ya existe: solo se valida si se adjunta uno nuevo.
      if (!state.file) return isEdit ? undefined : 'Adjunta el archivo PDF del trabajo.'
      if (state.file.type && state.file.type !== 'application/pdf') return 'El archivo debe ser un PDF.'
      return undefined
    default:
      return undefined
  }
}

function validateFields(fields: (keyof FormState)[], state: FormState, isEdit = false): FormErrors {
  const nextErrors: FormErrors = {}
  fields.forEach((field) => {
    const message = validateField(field, state, isEdit)
    if (message) nextErrors[field] = message
  })
  return nextErrors
}

export default function Submission() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [focusRequest, setFocusRequest] = useState<{ field: keyof FormState } | null>(null)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const isEdit = Boolean(editId)
  const [editTrabajo, setEditTrabajo] = useState<Trabajo | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(isEdit)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    categoriaService.listar()
      .then((res) => setCategorias(res.data.data))
      .catch(() => {})
  }, [])

  /** Precarga el formulario con los datos del trabajo a editar (?edit=<id>). */
  useEffect(() => {
    if (!editId) {
      setEditTrabajo(null)
      setEditError('')
      setLoadingEdit(false)
      setForm(initialState)
      setErrors({})
      setStep(1)
      setSubmitted(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setLoadingEdit(true)
    setEditError('')
    trabajoService.obtenerPorId(editId)
      .then((res) => {
        const trabajo = res.data.data
        const metadatos = metadatosRecord(trabajo.metadatos)
        setEditTrabajo(trabajo)
        setForm({
          title: trabajo.titulo,
          authors: trabajo.autor,
          tutor: trabajo.tutor ?? '',
          year: trabajo.anio ? String(trabajo.anio) : '',
          documentType: typeof metadatos.tipo_documento === 'string' ? metadatos.tipo_documento : '',
          program: typeof metadatos.carrera === 'string' ? metadatos.carrera : '',
          categoryId: trabajo.categoria_id ?? '',
          description: trabajo.resumen ?? '',
          keywords: (trabajo.palabras_clave ?? []).join(', '),
          publicationState: trabajo.estado === 'publicado' ? 'published' : trabajo.estado === 'archivado' ? 'archived' : 'draft',
          file: null,
        })
        setErrors({})
        setSubmitted(false)
        setStep(1)
        if (fileInputRef.current) fileInputRef.current.value = ''
      })
      .catch(() => setEditError('No se pudo cargar el documento a editar.'))
      .finally(() => setLoadingEdit(false))
  }, [editId])

  const authorsPreview = useMemo(
    () => form.authors.split(',').map((author) => author.trim()).filter(Boolean),
    [form.authors],
  )

  /** Clase extra para los campos que usan el componente Input cuando tienen error. */
  function inputErrorClass(field: keyof FormState): string {
    return errors[field] ? '!border-rose-500 focus:!ring-rose-300' : ''
  }

  /** Bordes para los campos nativos (select/textarea) según su estado de error. */
  function borderClass(field: keyof FormState): string {
    return errors[field]
      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-300 dark:border-rose-500'
      : 'border-slate-300 focus:border-unefa focus:ring-unefa/20 dark:border-slate-600'
  }

  function requestFocus(field: keyof FormState) {
    setFocusRequest({ field })
  }

  useEffect(() => {
    if (!focusRequest) return
    const element = document.querySelector<HTMLElement>(`[data-field="${focusRequest.field}"]`)
    if (!element) return
    element.focus({ preventScroll: true })
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusRequest])

  function setErrorFor(field: keyof FormState, message?: string) {
    setErrors((previous) => {
      const next = { ...previous }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }

  function applyErrorUpdates(updates: FormErrors) {
    Object.entries(updates).forEach(([field, message]) => {
      setErrorFor(field as keyof FormState, message)
    })
  }

  function firstErrorField(errs: FormErrors): (keyof FormState) | undefined {
    return FIELD_ORDER.find((field) => errs[field])
  }

  function toastErrors(errs: FormErrors) {
    toastFieldErrors(errs, FIELD_LABELS)
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    const nextForm = { ...form, [field]: value }
    setForm(nextForm)
    if (errors[field]) {
      setErrorFor(field, validateField(field, nextForm))
    }
  }

  function goToField(field: keyof FormState) {
    const targetStep = STEP_TWO_FIELDS.includes(field) ? 2 : 1
    if (step !== targetStep) setStep(targetStep)
    requestFocus(field)
  }

  function handleNext() {
    const nextErrors = validateFields(STEP_ONE_FIELDS, form, isEdit)
    applyErrorUpdates(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      setStep(2)
      return
    }
    const first = firstErrorField(nextErrors)
    if (first) requestFocus(first)
    toastErrors(nextErrors)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setApiError('')

    const allErrors = validateFields([...STEP_ONE_FIELDS, ...STEP_TWO_FIELDS], form, isEdit)
    applyErrorUpdates(allErrors)

    if (Object.keys(allErrors).length > 0) {
      const first = firstErrorField(allErrors)
      if (first) {
        setStep(STEP_TWO_FIELDS.includes(first) ? 2 : 1)
        requestFocus(first)
      }
      toastErrors(allErrors)
      return
    }

    if (!user) {
      setApiError(isEdit ? 'Debes iniciar sesión para editar un trabajo.' : 'Debes iniciar sesión para subir un trabajo.')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('titulo', form.title.trim())
      formData.append('autor', form.authors.trim())
      formData.append('tutor', form.tutor.trim())
      formData.append('anio', form.year)
      formData.append('resumen', form.description)
      formData.append('categoria_id', form.categoryId)
      formData.append('palabras_clave', JSON.stringify(parseKeywords(form.keywords)))

      // Los metadatos se combinan con los existentes para no perder datos
      // que no están en el formulario (idioma, páginas, DOI, etc.).
      const metadatos: Record<string, unknown> = { ...(isEdit ? metadatosRecord(editTrabajo?.metadatos) : {}) }
      if (form.documentType) metadatos.tipo_documento = form.documentType
      else delete metadatos.tipo_documento
      if (form.program.trim()) metadatos.carrera = form.program.trim()
      else delete metadatos.carrera
      formData.append('metadatos', JSON.stringify(metadatos))

      if (form.file) {
        formData.append('archivo', form.file)
      }

      if (isEdit && editId) {
        // Modo edición: se conserva el estado actual (no se envía `estado`)
        // para no interferir con el flujo de revisión.
        await trabajoService.actualizarConArchivo(editId, formData)
        toast.success('Cambios guardados correctamente')
        navigate(`/trabajos/${editId}`)
        return
      }

      formData.append('estado', form.publicationState === 'published' ? 'publicado' : form.publicationState === 'archived' ? 'archivado' : 'borrador')
      await trabajoService.crearConArchivo(formData)
      setSubmitted(true)
      setForm(initialState)
      setStep(1)
      setErrors({})
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      setApiError(err.response?.data?.message || err.response?.data?.error || (isEdit ? 'Error al guardar los cambios.' : 'Error al enviar el trabajo.'))
    } finally {
      setSubmitting(false)
    }
  }

  const errorEntries = FIELD_ORDER
    .filter((field) => errors[field])
    .map((field) => ({ field, message: errors[field] as string }))

  const keywordsPreview = useMemo(() => parseKeywords(form.keywords), [form.keywords])

  if (isEdit && loadingEdit) {
    return (
      <section className="space-y-6">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-8 text-center text-slate-500 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-slate-400">
          Cargando documento a editar...
        </div>
      </section>
    )
  }

  if (isEdit && editError) {
    return (
      <section className="space-y-6">
        <div className="rounded-[1.75rem] border border-rose-100 bg-rose-50 p-8 text-center text-rose-700 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <p className="text-lg font-semibold">{editError}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/search')}>Volver a búsqueda</Button>
            <Button type="button" onClick={() => navigate('/submission')}>Subir un documento nuevo</Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
      <div className="space-y-6">
        <div className="max-w-3xl space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">{isEdit ? 'Edición' : 'Submission'}</p>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{isEdit ? 'Editar documento' : 'Carga de documentos'}</h2>
          <p className="text-slate-600 dark:text-slate-300">
            {isEdit
              ? 'Actualiza los metadatos del trabajo publicado. El estado de publicación se conserva y el archivo PDF solo cambia si adjuntas uno nuevo.'
              : 'Flujo multistep para registrar metadatos, adjuntar archivo y definir el estado de publicación.'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm font-medium">
          <span className={`rounded-full px-3 py-1 ${step === 1 ? 'bg-unefa text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'}`}>1. Metadatos</span>
          <span className={`rounded-full px-3 py-1 ${step === 2 ? 'bg-unefa text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'}`}>{isEdit ? '2. Resumen y archivo' : '2. Archivo y revisión'}</span>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {errorEntries.length > 0 ? (
            <Card className="space-y-2 border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/40">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {errorEntries.length === 1
                  ? 'Hay 1 error en el formulario'
                  : `Hay ${errorEntries.length} errores en el formulario`}
              </p>
              <ul className="space-y-1">
                {errorEntries.map(({ field, message }) => (
                  <li key={field}>
                    <button
                      type="button"
                      onClick={() => goToField(field)}
                      className="text-left text-sm text-rose-700 hover:underline dark:text-rose-300"
                    >
                      {FIELD_LABELS[field]}: {message}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          {step === 1 ? (
            <Card className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Título</span>
                  <Input data-field="title" value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Título del trabajo" aria-invalid={errors.title ? true : undefined} className={inputErrorClass('title')} />
                  {errors.title ? <p className="text-sm text-red-600">{errors.title}</p> : null}
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Autores separados por coma</span>
                  <Input data-field="authors" value={form.authors} onChange={(event) => updateField('authors', event.target.value)} placeholder="Nombre Apellido, Nombre Apellido" aria-invalid={errors.authors ? true : undefined} className={inputErrorClass('authors')} />
                  {errors.authors ? <p className="text-sm text-red-600">{errors.authors}</p> : null}
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tutor / asesor</span>
                  <Input data-field="tutor" value={form.tutor} onChange={(event) => updateField('tutor', event.target.value)} placeholder="Nombre del tutor (opcional)" aria-invalid={errors.tutor ? true : undefined} className={inputErrorClass('tutor')} />
                  {errors.tutor ? <p className="text-sm text-red-600">{errors.tutor}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Año</span>
                  <Input data-field="year" value={form.year} onChange={(event) => updateField('year', event.target.value.replace(/\D/g, ''))} placeholder="2026" inputMode="numeric" aria-invalid={errors.year ? true : undefined} className={inputErrorClass('year')} />
                  {errors.year ? <p className="text-sm text-red-600">{errors.year}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Programa académico</span>
                  <Input data-field="program" value={form.program} onChange={(event) => updateField('program', event.target.value)} placeholder="Ingeniería / Educación / Administración" aria-invalid={errors.program ? true : undefined} className={inputErrorClass('program')} />
                  {errors.program ? <p className="text-sm text-red-600">{errors.program}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de documento</span>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-unefa focus:ring-2 focus:ring-unefa/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    value={form.documentType}
                    onChange={(event) => updateField('documentType', event.target.value)}
                  >
                    <option value="">Selecciona un tipo</option>
                    {TIPOS_DOCUMENTO.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoría</span>
                  <select
                    data-field="categoryId"
                    className={`w-full rounded-xl border bg-white px-4 py-2 text-sm outline-none transition focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${borderClass('categoryId')}`}
                    value={form.categoryId}
                    onChange={(event) => updateField('categoryId', event.target.value)}
                    aria-invalid={errors.categoryId ? true : undefined}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                  {errors.categoryId ? <p className="text-sm text-red-600">{errors.categoryId}</p> : null}
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Palabras clave (separadas por coma)</span>
                  <Input data-field="keywords" value={form.keywords} onChange={(event) => updateField('keywords', event.target.value)} placeholder="educación virtual, aprendizaje, repositorio" aria-invalid={errors.keywords ? true : undefined} className={inputErrorClass('keywords')} />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ayudan a que el trabajo aparezca en la búsqueda. Máximo 15.</p>
                  {errors.keywords ? <p className="text-sm text-red-600">{errors.keywords}</p> : null}
                </label>
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={handleNext}>Continuar</Button>
              </div>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card className="space-y-5">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Resumen / descripción</span>
                <textarea
                  data-field="description"
                  className={`min-h-32 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${borderClass('description')}`}
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  placeholder="Resumen del contenido, objetivos y alcance"
                  aria-invalid={errors.description ? true : undefined}
                />
                {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isEdit ? 'Archivo PDF (opcional: solo si quieres reemplazar el actual)' : 'Archivo PDF'}
                </span>
                <Input
                  ref={fileInputRef}
                  data-field="file"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => updateField('file', event.target.files?.[0] ?? null)}
                  aria-invalid={errors.file ? true : undefined}
                  className={inputErrorClass('file')}
                />
                {errors.file ? <p className="text-sm text-red-600">{errors.file}</p> : null}
                {form.file ? <p className="text-sm text-slate-500 dark:text-slate-400">Archivo seleccionado: {form.file.name}</p> : null}
                {isEdit && editTrabajo?.archivo_url && !form.file ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Se mantendrá el archivo PDF actual del documento.</p>
                ) : null}
              </label>

              {isEdit ? null : (
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado inicial de publicación</span>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-unefa focus:ring-2 focus:ring-unefa/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    value={form.publicationState}
                    onChange={(event) => updateField('publicationState', event.target.value as FormState['publicationState'])}
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </label>
              )}

              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  Volver
                </Button>
                <div className="flex items-center gap-3">
                  {isEdit ? (
                    <Button type="button" variant="secondary" onClick={() => navigate(`/trabajos/${editId}`)}>
                      Cancelar
                    </Button>
                  ) : null}
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (isEdit ? 'Guardando...' : 'Enviando...') : isEdit ? 'Guardar cambios' : 'Guardar envío'}
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}
        </form>

        {apiError ? (
          <Card className="border border-rose-200 bg-rose-50/60">
            <p className="text-sm text-rose-700">{apiError}</p>
          </Card>
        ) : null}

        {submitted ? (
          <Card className="border border-emerald-200 bg-emerald-50/60">
            <p className="text-sm font-semibold text-emerald-800">Envío registrado correctamente</p>
            <p className="mt-2 text-sm text-emerald-700">El trabajo se ha guardado en el repositorio.</p>
          </Card>
        ) : null}
      </div>

      <div className="space-y-4">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">Vista previa</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{form.title || 'Sin título aún'}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{authorsPreview.length > 0 ? authorsPreview.join(', ') : 'Autores pendientes'}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-700 dark:text-slate-300">{form.documentType}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{form.year || 'Año'}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {isEdit && editTrabajo ? ESTADO_LABELS[editTrabajo.estado] : form.publicationState}
            </span>
          </div>
          {keywordsPreview.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {keywordsPreview.map((keyword) => (
                <span key={keyword} className="rounded-full bg-unefa/10 px-2 py-0.5 text-xs font-semibold text-unefa-dark dark:text-unefa-accent">{keyword}</span>
              ))}
            </div>
          ) : null}
        </Card>

        <Card>
          <p className="text-sm font-semibold text-unefa">Validaciones activas</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>Metadatos obligatorios antes de avanzar.</li>
            <li>{isEdit ? 'El archivo PDF es opcional: solo se reemplaza si adjuntas uno nuevo.' : 'Archivo PDF requerido en la segunda etapa.'}</li>
            <li>Los datos se envían a la API real del backend.</li>
          </ul>
        </Card>
      </div>
    </section>
  )
}
