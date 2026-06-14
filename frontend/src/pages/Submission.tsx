import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { trabajoService, categoriaService, type Categoria } from '../services/trabajoService'
import { useAuthStore } from '../stores/useAuthStore'

type Step = 1 | 2

type FormState = {
  title: string
  authors: string
  year: string
  documentType: 'tesis' | 'trabajo' | 'articulo'
  program: string
  categoryId: string
  description: string
  publicationState: 'draft' | 'published' | 'archived'
  file: File | null
}

type FormErrors = Partial<Record<keyof FormState, string>>

const initialState: FormState = {
  title: '',
  authors: '',
  year: '',
  documentType: 'tesis',
  program: '',
  categoryId: '',
  description: '',
  publicationState: 'draft',
  file: null,
}

export default function Submission() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    categoriaService.listar()
      .then((res) => setCategorias(res.data.data))
      .catch(() => {})
  }, [])

  const authorsPreview = useMemo(
    () => form.authors.split(',').map((author) => author.trim()).filter(Boolean),
    [form.authors],
  )

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validateStepOne() {
    const nextErrors: FormErrors = {}

    if (!form.title.trim()) nextErrors.title = 'El título es obligatorio.'
    if (!form.authors.trim()) nextErrors.authors = 'Agrega al menos un autor.'
    if (!form.year.trim()) nextErrors.year = 'El año es obligatorio.'
    if (form.year.trim() && Number.isNaN(Number(form.year))) nextErrors.year = 'El año debe ser numérico.'
    if (!form.program.trim()) nextErrors.program = 'Indica el programa académico.'
    if (!form.categoryId) nextErrors.categoryId = 'Selecciona una categoría.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function validateStepTwo() {
    const nextErrors: FormErrors = {}

    if (!form.description.trim()) nextErrors.description = 'Describe brevemente el documento.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleNext() {
    if (validateStepOne()) setStep(2)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setApiError('')

    const validStepOne = validateStepOne()
    const validStepTwo = validateStepTwo()

    if (!validStepOne || !validStepTwo) {
      setStep(!validStepOne ? 1 : 2)
      return
    }

    if (!user) {
      setApiError('Debes iniciar sesión para subir un trabajo.')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('titulo', form.title)
      formData.append('autor', form.authors)
      formData.append('anio', form.year)
      formData.append('resumen', form.description)
      formData.append('categoria_id', form.categoryId)
      formData.append('estado', form.publicationState === 'published' ? 'publicado' : form.publicationState === 'archived' ? 'archivado' : 'borrador')
      formData.append('metadatos', JSON.stringify({
        tipo_documento: form.documentType,
        carrera: form.program,
      }))
      if (form.file) {
        formData.append('archivo', form.file)
      }

      await trabajoService.crearConArchivo(formData)
      setSubmitted(true)
      setForm(initialState)
      setStep(1)
      setErrors({})
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      setApiError(err.response?.data?.message || err.response?.data?.error || 'Error al enviar el trabajo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
      <div className="space-y-6">
        <div className="max-w-3xl space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">Submission</p>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Carga de documentos</h2>
          <p className="text-slate-600">Flujo multistep para registrar metadatos, adjuntar archivo y definir el estado de publicación.</p>
        </div>

        <div className="flex items-center gap-3 text-sm font-medium">
          <span className={`rounded-full px-3 py-1 ${step === 1 ? 'bg-unefa text-white' : 'bg-slate-100 text-slate-500'}`}>1. Metadatos</span>
          <span className={`rounded-full px-3 py-1 ${step === 2 ? 'bg-unefa text-white' : 'bg-slate-100 text-slate-500'}`}>2. Archivo y revisión</span>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {step === 1 ? (
            <Card className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Título</span>
                  <Input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Título del trabajo" />
                  {errors.title ? <p className="text-sm text-red-600">{errors.title}</p> : null}
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Autores separados por coma</span>
                  <Input value={form.authors} onChange={(event) => updateField('authors', event.target.value)} placeholder="Nombre Apellido, Nombre Apellido" />
                  {errors.authors ? <p className="text-sm text-red-600">{errors.authors}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Año</span>
                  <Input value={form.year} onChange={(event) => updateField('year', event.target.value)} placeholder="2026" inputMode="numeric" />
                  {errors.year ? <p className="text-sm text-red-600">{errors.year}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Programa académico</span>
                  <Input value={form.program} onChange={(event) => updateField('program', event.target.value)} placeholder="Ingeniería / Educación / Administración" />
                  {errors.program ? <p className="text-sm text-red-600">{errors.program}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Tipo de documento</span>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-unefa focus:ring-2 focus:ring-unefa/20"
                    value={form.documentType}
                    onChange={(event) => updateField('documentType', event.target.value as FormState['documentType'])}
                  >
                    <option value="tesis">Tesis</option>
                    <option value="trabajo">Trabajo de grado</option>
                    <option value="articulo">Artículo</option>
                  </select>
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Categoría</span>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-unefa focus:ring-2 focus:ring-unefa/20"
                    value={form.categoryId}
                    onChange={(event) => updateField('categoryId', event.target.value)}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                  {errors.categoryId ? <p className="text-sm text-red-600">{errors.categoryId}</p> : null}
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
                <span className="text-sm font-medium text-slate-700">Resumen / descripción</span>
                <textarea
                  className="min-h-32 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-unefa focus:ring-2 focus:ring-unefa/20"
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  placeholder="Resumen del contenido, objetivos y alcance"
                />
                {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Archivo PDF</span>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => updateField('file', event.target.files?.[0] ?? null)}
                />
                {errors.file ? <p className="text-sm text-red-600">{errors.file}</p> : null}
                {form.file ? <p className="text-sm text-slate-500">Archivo seleccionado: {form.file.name}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Estado inicial de publicación</span>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-unefa focus:ring-2 focus:ring-unefa/20"
                  value={form.publicationState}
                  onChange={(event) => updateField('publicationState', event.target.value as FormState['publicationState'])}
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
              </label>

              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  Volver
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Guardar envío'}
                </Button>
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
          <h3 className="mt-2 text-xl font-bold text-slate-900">{form.title || 'Sin título aún'}</h3>
          <p className="mt-2 text-sm text-slate-600">{authorsPreview.length > 0 ? authorsPreview.join(', ') : 'Autores pendientes'}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{form.documentType}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{form.year || 'Año'}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{form.publicationState}</span>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-unefa">Validaciones activas</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Metadatos obligatorios antes de avanzar.</li>
            <li>Archivo PDF requerido en la segunda etapa.</li>
            <li>Los datos se envían a la API real del backend.</li>
          </ul>
        </Card>
      </div>
    </section>
  )
}
