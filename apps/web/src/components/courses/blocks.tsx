import { marked } from 'marked'
import { Info, Lightbulb } from 'lucide-react'
import type { Block } from '@hookdrill/courses'
import { CourseFigure } from './figures'

// Course content is our own, reviewed source, like problem descriptions.
export const md = (source: string) => marked.parse(source, { async: false })
export const mdInline = (source: string) =>
  marked.parseInline(source, { async: false })

export function Prose({ source }: { source: string }) {
  return (
    <div
      className="prose-lesson"
      dangerouslySetInnerHTML={{ __html: md(source) }}
    />
  )
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return <Prose source={block.md} />
    case 'figure':
      return <CourseFigure figure={block.figure} caption={block.caption} />
    case 'example':
      return (
        <aside className="my-6 rounded-xl border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-brand">
            <Lightbulb className="size-3.5" />
            Teaching example
          </p>
          <h4 className="mt-1.5 font-semibold">{block.title}</h4>
          <div className="mt-2 text-[15px]">
            <Prose source={block.md} />
          </div>
        </aside>
      )
    case 'terms':
      return (
        <dl className="my-6 divide-y rounded-xl border">
          {block.terms.map((t) => (
            <div
              key={t.term}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4"
            >
              <dt className="font-semibold">{t.term}</dt>
              <dd
                className="text-[15px] leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: mdInline(t.definition) }}
              />
            </div>
          ))}
        </dl>
      )
    case 'note':
      return (
        <aside className="my-6 flex gap-3 rounded-xl bg-secondary/70 p-4 text-[15px]">
          <Info className="mt-1 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <Prose source={block.md} />
          </div>
        </aside>
      )
  }
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </>
  )
}
