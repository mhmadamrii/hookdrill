import { useId, type ReactNode } from 'react'
import type { FigureId } from '@hookdrill/courses'

const box = 'fill-card stroke-border'
const accent = 'fill-primary/10 stroke-primary/50'
const label = 'fill-foreground font-medium'
const muted = 'fill-muted-foreground'

function Svg({
  viewBox,
  title,
  children,
}: {
  viewBox: string
  title: string
  children: ReactNode
}) {
  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={title}
      className="h-auto w-full"
      fontSize="14"
    >
      {children}
    </svg>
  )
}

/** An arrowhead marker; ids must be unique per page. */
function useArrow() {
  const id = useId().replace(/:/g, '')
  const marker = (
    <defs>
      <marker
        id={id}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0 0 10 5 0 10z" className={muted} />
      </marker>
    </defs>
  )
  return { marker, end: `url(#${id})` }
}

function AiNesting() {
  const rings = [
    {
      x: 8,
      y: 8,
      w: 464,
      h: 304,
      name: 'Artificial intelligence',
      note: 'Machines doing tasks that call for intelligence',
    },
    {
      x: 36,
      y: 70,
      w: 408,
      h: 214,
      name: 'Machine learning',
      note: 'Learns patterns from data instead of hand-written rules',
    },
    {
      x: 64,
      y: 132,
      w: 352,
      h: 124,
      name: 'Deep learning',
      note: 'Machine learning with many-layered neural networks',
    },
    {
      x: 92,
      y: 194,
      w: 296,
      h: 34,
      name: 'Large language models',
      note: '',
    },
  ]
  return (
    <Svg
      viewBox="0 0 480 320"
      title="Nested regions: artificial intelligence contains machine learning, which contains deep learning, which contains large language models."
    >
      {rings.map((r, i) => (
        <g key={r.name}>
          <rect
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            rx={18 - i * 3}
            strokeWidth="1.5"
            className={i === 3 ? accent : box}
            fillOpacity={i === 3 ? undefined : 0.6 + i * 0.1}
          />
          <text x={r.x + 16} y={r.y + (r.note ? 26 : 22)} className={label}>
            {r.name}
          </text>
          {r.note && (
            <text x={r.x + 16} y={r.y + 46} fontSize="12" className={muted}>
              {r.note}
            </text>
          )}
        </g>
      ))}
    </Svg>
  )
}

function Node({
  x,
  y,
  w,
  text,
  strong,
}: {
  x: number
  y: number
  w: number
  text: string
  strong?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={40}
        rx={8}
        strokeWidth="1.5"
        className={strong ? accent : box}
      />
      <text x={x + w / 2} y={y + 25} textAnchor="middle" className={label}>
        {text}
      </text>
    </g>
  )
}

function RulesVsLearning() {
  const { marker, end } = useArrow()
  const arrow = (x1: number, y1: number, x2: number, y2: number) => (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      strokeWidth="1.5"
      markerEnd={end}
      className="stroke-muted-foreground"
    />
  )
  return (
    <Svg
      viewBox="0 0 520 330"
      title="Traditional programming turns rules and data into answers. Machine learning turns data and expected answers into a model, which then makes predictions on new data."
    >
      {marker}
      <text x="8" y="20" fontSize="12" className={muted}>
        TRADITIONAL PROGRAMMING
      </text>
      <Node x={8} y={34} w={96} text="Rules" />
      <Node x={8} y={84} w={96} text="Data" />
      {arrow(110, 80, 182, 80)}
      <Node x={190} y={60} w={120} text="Program" strong />
      {arrow(316, 80, 388, 80)}
      <Node x={396} y={60} w={116} text="Answers" />

      <line
        x1="8"
        x2="512"
        y1="148"
        y2="148"
        strokeDasharray="4 4"
        className="stroke-border"
      />

      <text x="8" y="176" fontSize="12" className={muted}>
        MACHINE LEARNING
      </text>
      <Node x={8} y={190} w={96} text="Data" />
      <Node x={8} y={240} w={96} text="Answers" />
      {arrow(110, 236, 182, 236)}
      <Node x={190} y={216} w={120} text="Training" strong />
      {arrow(316, 236, 388, 236)}
      <Node x={396} y={216} w={116} text="Model" />
      <text x="512" y="300" textAnchor="end" fontSize="12" className={muted}>
        Then: new data → model → predictions
      </text>
    </Svg>
  )
}

function NeuralNetwork() {
  const layers = [
    { x: 60, n: 3, name: 'Input' },
    { x: 200, n: 4, name: 'Hidden' },
    { x: 340, n: 4, name: 'Hidden' },
    { x: 460, n: 2, name: 'Output' },
  ]
  const ys = (n: number) =>
    Array.from({ length: n }, (_, i) => 130 + (i - (n - 1) / 2) * 56)
  return (
    <Svg
      viewBox="0 0 520 290"
      title="A small fully connected neural network: 3 inputs, two hidden layers of 4 neurons, and 2 outputs. Every connection carries a learned weight."
    >
      {layers
        .slice(0, -1)
        .map((layer, li) =>
          ys(layer.n).flatMap((y1, a) =>
            ys(layers[li + 1].n).map((y2, b) => (
              <line
                key={`${li}-${a}-${b}`}
                x1={layer.x}
                y1={y1}
                x2={layers[li + 1].x}
                y2={y2}
                strokeWidth="1"
                className={
                  li === 0 && a === 0 && b === 0
                    ? 'stroke-primary'
                    : 'stroke-border'
                }
              />
            )),
          ),
        )}
      <text x="96" y="22" fontSize="12" className="fill-brand">
        each line is a weight
      </text>
      {layers.map((layer) =>
        ys(layer.n).map((y, i) => (
          <g key={`${layer.x}-${i}`}>
            <circle cx={layer.x} cy={y} r="15" className="fill-card" />
            <circle
              cx={layer.x}
              cy={y}
              r="15"
              strokeWidth="1.5"
              className={layer.name === 'Hidden' ? box : accent}
            />
          </g>
        )),
      )}
      {layers.map((layer, i) => (
        <text
          key={i}
          x={layer.x}
          y="275"
          textAnchor="middle"
          fontSize="13"
          className={muted}
        >
          {layer.name}
        </text>
      ))}
    </Svg>
  )
}

function AgentLoop() {
  const { marker, end } = useArrow()
  const path = (d: string) => (
    <path
      d={d}
      fill="none"
      strokeWidth="1.5"
      markerEnd={end}
      className="stroke-muted-foreground"
    />
  )
  return (
    <Svg
      viewBox="0 0 520 300"
      title="The agent loop: given a goal, the model decides the next step, calls a tool, observes the result and decides again, until it returns a final answer or hits a stop condition."
    >
      {marker}
      <Node x={8} y={40} w={100} text="Goal" />
      {path('M114 60 H170')}
      <Node x={178} y={40} w={160} text="Model decides" strong />
      {path('M344 52 H404')}
      <text x="374" y="40" textAnchor="middle" fontSize="12" className={muted}>
        tool call
      </text>
      <Node x={412} y={40} w={100} text="Tool" />
      {path('M462 86 V130 Q462 146 446 146 H316 Q300 146 300 130 V90')}
      <text x="381" y="166" textAnchor="middle" fontSize="12" className={muted}>
        observe the result
      </text>
      {path('M216 86 V232')}
      <text x="226" y="200" fontSize="12" className={muted}>
        done
      </text>
      <Node x={178} y={240} w={160} text="Final answer" />
      <text x="8" y="226" fontSize="12" className={muted}>
        or stop: step limit,
      </text>
      <text x="8" y="244" fontSize="12" className={muted}>
        error, or a person
      </text>
      <text x="8" y="262" fontSize="12" className={muted}>
        steps in
      </text>
    </Svg>
  )
}

const milestones: Array<[string, string]> = [
  [
    '1950',
    'Alan Turing asks whether machines can think, in “Computing Machinery and Intelligence”',
  ],
  [
    '1956',
    'The Dartmouth workshop gives the field its name, “artificial intelligence”',
  ],
  ['1980s', 'Expert systems: hand-written rules encode specialist knowledge'],
  [
    '1986',
    'Rumelhart, Hinton and Williams popularize backpropagation for training neural networks',
  ],
  ['1997', 'IBM’s Deep Blue beats world chess champion Garry Kasparov'],
  [
    '2012',
    'AlexNet wins the ImageNet challenge, starting the deep learning boom',
  ],
  ['2017', '“Attention Is All You Need” introduces the Transformer'],
  ['2022', 'ChatGPT brings large language models to the public'],
]

function AiTimeline() {
  return (
    <ol className="relative ml-1 border-l pl-6">
      {milestones.map(([year, event]) => (
        <li key={year} className="relative py-2">
          <span
            aria-hidden
            className="absolute top-[0.95rem] -left-[1.85rem] size-2.5 rounded-full border-2 border-card bg-primary ring-1 ring-primary/40"
          />
          <span className="mr-3 inline-block w-12 font-semibold tabular-nums">
            {year}
          </span>
          <span className="text-muted-foreground">{event}</span>
        </li>
      ))}
    </ol>
  )
}

const figures: Record<FigureId, () => ReactNode> = {
  'ai-nesting': AiNesting,
  'rules-vs-learning': RulesVsLearning,
  'neural-network': NeuralNetwork,
  'agent-loop': AgentLoop,
  'ai-timeline': AiTimeline,
}

export function CourseFigure({
  figure,
  caption,
}: {
  figure: FigureId
  caption: string
}) {
  const Figure = figures[figure]
  return (
    <figure className="my-6 rounded-xl border bg-surface-2/40 p-4 md:p-6">
      <div className="mx-auto max-w-xl">
        <Figure />
      </div>
      <figcaption className="mt-4 text-center text-sm text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  )
}
