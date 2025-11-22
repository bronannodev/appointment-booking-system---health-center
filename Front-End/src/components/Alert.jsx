import React from 'react'

const variantStyles = {
  info: 'bg-blue-50 text-blue-800 ring-blue-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  error: 'bg-rose-50 text-rose-800 ring-rose-200',
}

function Alert({ variant = 'info', title, children, onClose }) {
  const color = variantStyles[variant] || variantStyles.info

  return (
    <div className={`w-full rounded-md ring-1 px-4 py-3 ${color} flex items-start gap-3`} role="alert">
      <div className="flex-1 min-w-0">
        {title ? <p className="font-semibold leading-5">{title}</p> : null}
        {children ? <p className="text-sm leading-5 mt-0.5">{children}</p> : null}
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}

export default Alert


