import React from 'react'
import { motion } from 'framer-motion' //eslint-disable-line

function About() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" aria-hidden />
      {/* Efecto grainy */}
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '4px 4px'
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="mx-auto text-center bg-white/5 border border-slate-700 backdrop-blur rounded-xl shadow-lg p-6 sm:p-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
            Sobre el proyecto
          </h1>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Este portal busca facilitar el acceso a turnos, información y servicios del centro de salud,
            priorizando la accesibilidad, performance y una experiencia moderna.
          </p>
          <p className="mt-4 text-slate-400">
            Proyecto desarrollado por <a className="text-cyan-200 hover:text-cyan-700 transition">GRUPO JAVA</a>
          </p>
        </motion.div>

        {/* Stack de tecnologías dentro del cuadro */}
        <div className="mt-10">
          <h2 className=" text-center mx-auto mt-4 text-slate-300 leading-relaxed">Stack utilizado</h2>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <img
              src="https://icon.icepanel.io/Technology/svg/MySQL.svg"
              alt="MySQL"
              className="h-10 w-auto opacity-90 hover:opacity-100 transition hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]"
            />
            <img
              src="https://icon.icepanel.io/Technology/svg/React.svg"
              alt="React"
              className="h-10 w-auto opacity-90 hover:opacity-100 transition hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]"
            />
            <img
              src="https://icon.icepanel.io/Technology/svg/Tailwind-CSS.svg"
              alt="Tailwind CSS"
              className="h-10 w-auto opacity-90 hover:opacity-100 transition hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]"
            />
            <img
              src="https://img.icons8.com/?size=100&id=12592&format=png&color=FFFFFF"
              alt="Python"
              className="h-10 w-auto opacity-90 hover:opacity-100 transition hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default About


