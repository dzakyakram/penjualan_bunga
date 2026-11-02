'use client'

import { useRef, useState } from 'react'

/** Menampilkan bukti pembayaran langsung di halaman; klik untuk memperbesar tanpa pindah tab. */
export function ProofViewer({ src, alt }: { src: string; alt: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
        Gambar bukti tidak bisa dimuat.{' '}
        <a href={src} target="_blank" rel="noopener noreferrer" className="underline">Coba buka langsung</a>
      </p>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label="Perbesar bukti pembayaran"
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-white/40 focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} onError={() => setFailed(true)} className="max-h-72 w-full bg-white/40 object-contain" />
        <span className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">Klik untuk memperbesar</span>
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current?.close() }}
        className="m-auto max-h-[92vh] w-[min(92vw,56rem)] rounded-2xl bg-background p-3 text-foreground backdrop:bg-black/70"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="mx-auto max-h-[80vh] w-auto max-w-full object-contain" />
        <div className="mt-3 flex items-center justify-between gap-3">
          <a href={src} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Buka di tab baru</a>
          <button type="button" onClick={() => dialogRef.current?.close()} className="cursor-pointer rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
            Tutup
          </button>
        </div>
      </dialog>
    </>
  )
}
