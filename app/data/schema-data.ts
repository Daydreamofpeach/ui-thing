import type { Node, Edge } from '@vue-flow/core'

export const initialSchemaNodes: Node[] = [
  {
    id: '1',
    type: 'tableNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Users',
      columns: [
        { name: 'id', type: 'string', primaryKey: true },
        { name: 'email', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: true },
        { name: 'created_at', type: 'datetime', nullable: false },
        { name: 'updated_at', type: 'datetime', nullable: false }
      ]
    }
  },
  {
    id: '2',
    type: 'tableNode',
    position: { x: 400, y: 100 },
    data: {
      label: 'Organizations',
      columns: [
        { name: 'id', type: 'string', primaryKey: true },
        { name: 'name', type: 'string', nullable: false },
        { name: 'description', type: 'text', nullable: true },
        { name: 'created_at', type: 'datetime', nullable: false }
      ]
    }
  },
  {
    id: '3',
    type: 'tableNode',
    position: { x: 100, y: 400 },
    data: {
      label: 'Projects',
      columns: [
        { name: 'id', type: 'string', primaryKey: true },
        { name: 'name', type: 'string', nullable: false },
        { name: 'description', type: 'text', nullable: true },
        { name: 'organization_id', type: 'string', nullable: false },
        { name: 'created_at', type: 'datetime', nullable: false }
      ]
    }
  },
  {
    id: '4',
    type: 'tableNode',
    position: { x: 400, y: 400 },
    data: {
      label: 'Tasks',
      columns: [
        { name: 'id', type: 'string', primaryKey: true },
        { name: 'title', type: 'string', nullable: false },
        { name: 'description', type: 'text', nullable: true },
        { name: 'project_id', type: 'string', nullable: false },
        { name: 'assignee_id', type: 'string', nullable: true },
        { name: 'status', type: 'string', nullable: false },
        { name: 'created_at', type: 'datetime', nullable: false }
      ]
    }
  }
]

export const initialSchemaEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#6366f1' }
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981' }
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#f59e0b' }
  },
  {
    id: 'e1-4',
    source: '1',
    target: '4',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#ef4444' }
  }
]
