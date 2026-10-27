import { Star } from 'lucide-react'

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const rounded = Math.round(value)
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Rating ${value.toFixed(1)} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          aria-hidden
          className={i <= rounded ? 'fill-[oklch(0.76_0.17_75)] text-[oklch(0.76_0.17_75)]' : 'text-foreground/25'}
        />
      ))}
    </span>
  )
}

/** Pilih 1-5 bintang (radio, bekerja tanpa JavaScript). */
export function StarInput({ name = 'rating', idPrefix = 'rating' }: { name?: string; idPrefix?: string }) {
  return (
    <div className="star-input relative" role="radiogroup" aria-label="Rating">
      {[5, 4, 3, 2, 1].map((n) => (
        <span key={n} className="contents">
          <input type="radio" id={`${idPrefix}-${n}`} name={name} value={n} required />
          <label htmlFor={`${idPrefix}-${n}`} title={`${n} bintang`}>
            <Star className="size-7 fill-current" aria-hidden />
            <span className="sr-only">{n} bintang</span>
          </label>
        </span>
      ))}
    </div>
  )
}
