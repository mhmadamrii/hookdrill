import { useId } from 'react'
import type {
  DiagramEdge,
  DiagramNode,
  DiagramNodeKind,
} from '@hookdrill/courses'

const CELL_W = 150
const CELL_H = 92
const BOX_W = 124
const BOX_H = 44
const PAD = 12

const kindLabel: Record<DiagramNodeKind, string> = {
  client: 'Client',
  service: 'Service',
  store: 'Database',
  cache: 'Cache',
  queue: 'Queue',
  external: 'External',
  balancer: 'Load balancer',
}

const center = (n: DiagramNode) => ({
  x: PAD + n.col * CELL_W + BOX_W / 2,
  y: PAD + n.row * CELL_H + BOX_H / 2,
})

/** Where the line from a box's centre towards (dx, dy) leaves the box. */
function exit(dx: number, dy: number, inset = 0) {
  const hw = BOX_W / 2 + inset
  const hh = BOX_H / 2 + inset
  const t = Math.min(
    dx === 0 ? Infinity : hw / Math.abs(dx),
    dy === 0 ? Infinity : hh / Math.abs(dy),
  )
  return { x: dx * t, y: dy * t }
}

function Shape({ node }: { node: DiagramNode }) {
  const { x, y } = center(node)
  const left = x - BOX_W / 2
  const top = y - BOX_H / 2
  const stroke = 'stroke-border'
  const fill =
    node.kind === 'client' || node.kind === 'external'
      ? 'fill-card'
      : node.kind === 'store' || node.kind === 'cache'
        ? 'fill-secondary'
        : 'fill-primary/10'
  if (node.kind === 'store' || node.kind === 'cache') {
    // A cylinder: databases and caches hold data.
    const ry = 6
    return (
      <g className={node.kind === 'cache' ? '[stroke-dasharray:4_3]' : ''}>
        <path
          d={`M${left} ${top + ry} V${top + BOX_H - ry} A${BOX_W / 2} ${ry} 0 0 0 ${left + BOX_W} ${top + BOX_H - ry} V${top + ry}`}
          strokeWidth="1.5"
          className={`${fill} ${stroke}`}
        />
        <ellipse
          cx={x}
          cy={top + ry}
          rx={BOX_W / 2}
          ry={ry}
          strokeWidth="1.5"
          className={`${fill} ${stroke}`}
        />
      </g>
    )
  }
  if (node.kind === 'queue') {
    return (
      <g>
        <rect
          x={left}
          y={top}
          width={BOX_W}
          height={BOX_H}
          rx={6}
          strokeWidth="1.5"
          className={`${fill} ${stroke}`}
        />
        {[1, 2, 3].map((i) => (
          <line
            key={i}
            x1={left + BOX_W - i * 9}
            x2={left + BOX_W - i * 9}
            y1={top + 6}
            y2={top + BOX_H - 6}
            className="stroke-border"
          />
        ))}
      </g>
    )
  }
  return (
    <rect
      x={left}
      y={top}
      width={BOX_W}
      height={BOX_H}
      rx={node.kind === 'client' ? BOX_H / 2 : 8}
      strokeWidth="1.5"
      strokeDasharray={node.kind === 'external' ? '4 3' : undefined}
      className={`${fill} ${node.kind === 'balancer' ? 'stroke-primary/60' : stroke}`}
    />
  )
}

function Edge({
  edge,
  nodes,
  marker,
}: {
  edge: DiagramEdge
  nodes: Map<string, DiagramNode>
  marker: string
}) {
  const a = nodes.get(edge.from)
  const b = nodes.get(edge.to)
  if (!a || !b) return null
  const ca = center(a)
  const cb = center(b)
  const dx = cb.x - ca.x
  const dy = cb.y - ca.y
  const s = exit(dx, dy, 2)
  const e = exit(-dx, -dy, 5)
  const x1 = ca.x + s.x
  const y1 = ca.y + s.y
  const x2 = cb.x + e.x
  const y2 = cb.y + e.y
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        strokeWidth="1.5"
        strokeDasharray={edge.dashed ? '5 4' : undefined}
        markerEnd={marker}
        className="stroke-muted-foreground"
      />
      {edge.label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 6}
          textAnchor="middle"
          fontSize="11"
          className="fill-muted-foreground"
          paintOrder="stroke"
          strokeWidth="4"
          stroke="var(--color-card)"
        >
          {edge.label}
        </text>
      )}
    </g>
  )
}

/** An architecture diagram from data: boxes on a grid, arrows between. */
export function Diagram({
  nodes,
  edges,
  caption,
}: {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  caption: string
}) {
  const id = useId().replace(/:/g, '')
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const cols = Math.max(...nodes.map((n) => n.col)) + 1
  const rows = Math.max(...nodes.map((n) => n.row)) + 1
  const width = PAD * 2 + (cols - 1) * CELL_W + BOX_W
  const height = PAD * 2 + (rows - 1) * CELL_H + BOX_H
  const description = `${caption} Components: ${nodes
    .map((n) => `${n.label} (${kindLabel[n.kind]})`)
    .join(', ')}. Connections: ${edges
    .map(
      (e) =>
        `${byId.get(e.from)?.label} to ${byId.get(e.to)?.label}${e.label ? ` (${e.label})` : ''}`,
    )
    .join('; ')}.`
  return (
    <figure className="my-6 rounded-lg border bg-card p-4 md:p-5">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={description}
          className="mx-auto h-auto w-full min-w-[480px]"
          style={{ maxWidth: width * 1.15 }}
          fontSize="13"
        >
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
              <path d="M0 0 10 5 0 10z" className="fill-muted-foreground" />
            </marker>
          </defs>
          {edges.map((e, i) => (
            <Edge key={i} edge={e} nodes={byId} marker={`url(#${id})`} />
          ))}
          {nodes.map((n) => {
            const { x, y } = center(n)
            return (
              <g key={n.id}>
                <Shape node={n} />
                <text
                  x={x}
                  y={y + 4.5}
                  textAnchor="middle"
                  className="fill-foreground font-medium"
                >
                  {n.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  )
}
