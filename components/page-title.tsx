export function PageTitle({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-prose text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
