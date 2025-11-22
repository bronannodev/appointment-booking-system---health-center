import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion' //eslint-disable-line

const images = [
  // Imágenes libres de Unsplash (puedes reemplazarlas por locales luego)
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1920&auto=format&fit=crop',
]

function Hero({ onVerTurnos, onIngresar }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const backgroundUrl = useMemo(() => images[currentIndex], [currentIndex])

  return (
    <section className="relative w-full min-h-[calc(100vh-64px)]">
      <div
        className="absolute inset-0 bg-center bg-cover transition-[background-image] duration-700"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
        aria-hidden
      />
      {/* Overlay tenue + gradiente para modernidad y legibilidad */}
      <div className="absolute inset-0 bg-slate-950/60" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-900/40 to-transparent" aria-hidden />

      {/* Contenido centrado absoluto */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <motion.div
          className="text-center text-slate-100 max-w-3xl"
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } }}
        >
          <motion.h1
            className="text-4xl sm:text-6xl font-extrabold tracking-tight drop-shadow-md"
            variants={{ hidden: { y: 18, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.45 } } }}
          >
            Cuidamos tu salud, cerca de ti
          </motion.h1>
          <motion.p
            className="mt-4 text-base sm:text-lg text-slate-200/90"
            variants={{ hidden: { y: 18, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.45, delay: 0.05 } } }}
          >
            Portal del Centro de Salud: gestiona turnos, ingresos y consultas.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.35 } } }}
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onVerTurnos}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Ver turnos disponibles
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onIngresar}
              className="inline-flex items-center justify-center rounded-full bg-white/90 px-8 py-3 text-sm font-semibold text-slate-900 shadow-lg hover:bg-white"
            >
              Ingresar
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, i) => (
          <span
            key={i}
            className={
              'h-2.5 w-2.5 rounded-full border border-white/60 transition-colors ' +
              (i === currentIndex ? 'bg-white' : 'bg-white/30')
            }
          />
        ))}
      </div>
    </section>
  )
}

export default Hero


