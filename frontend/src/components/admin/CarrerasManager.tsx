import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { carreraService, nivelService } from '../../services/entidadService'
import type { CarreraEntity } from '../../services/trabajoService'
import type { NivelAcademico } from '../../types'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Input from '../ui/Input'

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function errorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
  return message || fallback
}

export default function CarrerasManager() {
  const [carreras, setCarreras] = useState<CarreraEntity[]>([])
  const [niveles, setNiveles] = useState<NivelAcademico[]>([])
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [nivelId, setNivelId] = useState('')
  const [editing, setEditing] = useState<CarreraEntity | null>(null)
  const [loading, setLoading] = useState(false)

  const loadCarreras = useCallback(() => {
    carreraService.listar()
      .then((res) => setCarreras(res.data.data))
      .catch(() => toast.error('Error al cargar carreras'))
  }, [])

  useEffect(() => {
    loadCarreras()
    nivelService.listar()
      .then((res) => {
        setNiveles(res.data.data)
        setNivelId((actual) => actual || res.data.data[0]?.id || '')
      })
      .catch(() => toast.error('Error al cargar los niveles académicos'))
  }, [loadCarreras])

  function resetForm() {
    setNombre('')
    setSlug('')
    setDescripcion('')
    setNivelId(niveles[0]?.id ?? '')
    setEditing(null)
  }

  function startEdit(carrera: CarreraEntity) {
    setEditing(carrera)
    setNombre(carrera.nombre)
    setSlug(carrera.slug)
    setDescripcion(carrera.descripcion ?? '')
    setNivelId(carrera.nivel_id ?? carrera.nivel?.id ?? niveles[0]?.id ?? '')
  }

  async function save() {
    const finalSlug = slug.trim() || slugify(nombre)
    if (!nombre.trim()) {
      toast.error('El nombre de la carrera es obligatorio')
      return
    }
    if (!/^[a-z0-9-]+$/.test(finalSlug)) {
      toast.error('El slug solo puede contener minúsculas, números y guiones')
      return
    }

    setLoading(true)
    try {
      if (editing) {
        await carreraService.actualizar(editing.id, {
          nombre: nombre.trim(),
          slug: finalSlug,
          descripcion: descripcion.trim() || undefined,
          nivel_id: nivelId || undefined,
        })
        toast.success('Carrera actualizada')
      } else {
        await carreraService.crear({
          nombre: nombre.trim(),
          slug: finalSlug,
          descripcion: descripcion.trim() || undefined,
          nivel_id: nivelId || undefined,
        })
        toast.success('Carrera creada')
      }
      resetForm()
      loadCarreras()
    } catch (err) {
      toast.error(errorMessage(err, 'Error al guardar la carrera'))
    } finally {
      setLoading(false)
    }
  }

  async function remove(carrera: CarreraEntity) {
    if (!confirm(`¿Eliminar la carrera "${carrera.nombre}"?`)) return
    try {
      await carreraService.eliminar(carrera.id)
      toast.success(`Carrera "${carrera.nombre}" eliminada`)
      if (editing?.id === carrera.id) resetForm()
      loadCarreras()
    } catch (err) {
      toast.error(errorMessage(err, 'Error al eliminar la carrera'))
    }
  }

  return (
    <Card className="border-white/80 bg-white/90 dark:border-slate-700/50 dark:bg-slate-800/90">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Gestión de carreras</p>
        <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Carreras UNEFA</h3>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Catálogo de programas académicos de pregrado, maestría y doctorado. Cada trabajo del repositorio debe estar asociado a uno de estos programas.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{editing ? 'Editar carrera' : 'Nueva carrera'}</p>
          <div className="mt-4 space-y-3">
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre (ej: Ingeniería Eléctrica)"
            />
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Slug (opcional: se genera del nombre)"
            />
            <Input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción (opcional)"
            />
            <select
              value={nivelId}
              onChange={(e) => setNivelId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-unefa focus:ring-2 focus:ring-unefa/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {niveles.map((nivel) => (
                <option key={nivel.id} value={nivel.id}>{nivel.nombre}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button type="button" disabled={loading || !nombre.trim()} onClick={save}>
                {editing ? 'Actualizar' : 'Crear'}
              </Button>
              {editing ? (
                <Button variant="secondary" type="button" onClick={resetForm}>
                  Cancelar
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {carreras.length === 0 ? (
            <p className="text-sm text-slate-500">No hay carreras registradas.</p>
          ) : (
            carreras.map((carrera) => (
              <div key={carrera.id} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{carrera.nombre}</p>
                    {carrera.nivel ? (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        carrera.nivel.grupo === 'postgrado'
                          ? 'bg-violet-100 text-violet-800'
                          : 'bg-unefa/10 text-unefa-dark'
                      }`}>
                        {carrera.nivel.nombre}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {carrera.slug}{carrera.descripcion ? ` · ${carrera.descripcion}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(carrera)}
                    className="rounded-full bg-unefa/10 px-3 py-1 text-xs font-semibold text-unefa-dark hover:bg-unefa/20"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(carrera)}
                    className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
