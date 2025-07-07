import React from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow'
import 'reactflow/dist/style.css'

const initialNodes = [
  {
    id: 'jun',
    data: { label: 'Jun' },
    position: { x: 0, y: 0 },
    style: { background: '#cbd5e1', padding: 10 },
  },
  {
    id: 'mid',
    data: { label: 'Mid' },
    position: { x: 200, y: 100 },
    style: { background: '#93c5fd', padding: 10 },
  },
  {
    id: 'sen',
    data: { label: 'Sen' },
    position: { x: 400, y: 200 },
    style: { background: '#60a5fa', padding: 10 },
  },
  {
    id: 'lid',
    data: { label: 'Lid' },
    position: { x: 600, y: 300 },
    style: { background: '#3b82f6', padding: 10, color: 'white' },
  },
]

const initialEdges = [
  { id: 'jun-mid', source: 'jun', target: 'mid' },
  { id: 'mid-sen', source: 'mid', target: 'sen' },
  { id: 'sen-lid', source: 'sen', target: 'lid' },
]

export default function SkillTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds))

  return (
    <div style={{ width: '100%', height: '600px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
}
