import { useEffect, useRef } from 'react'
import { Heatmap } from '@/components/heatmap'

/** Shared heatmap, scrolled to the latest weeks when it overflows (phones). */
export function RecentHeatmap({ days }: { days: Array<{ date: string; count: number }> }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const scroller = ref.current?.firstElementChild as HTMLElement | null
    if (scroller) scroller.scrollLeft = scroller.scrollWidth
  }, [days.length])
  return (
    <div ref={ref} className="min-w-0">
      <Heatmap days={days} className="pb-1" />
    </div>
  )
}
