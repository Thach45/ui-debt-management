import { useQuery } from '@tanstack/react-query'

export function HomePage() {
  const { data, isPending } = useQuery({
    queryKey: ['setup-check'],
    queryFn: () => Promise.resolve('React Query đã gắn OK'),
  })

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-medium tracking-tight text-[var(--text-h)] md:text-5xl">
        Debt management
      </h1>
      <p className="text-[var(--text)]">{isPending ? 'Đang kiểm tra…' : data}</p>
    </section>
  )
}
