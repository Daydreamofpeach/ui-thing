import type { Node, Edge } from "@vue-flow/core";

export interface CustomTableField {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
}

export interface CustomTableData {
  label: string;
  fields: CustomTableField[];
  selected?: boolean;
}

export interface CustomTableEvents extends Record<string, any> {}

export type CustomNodeType = Node<CustomTableData, CustomTableEvents, string>;

export interface SchemaData {
  name: string;
  nodes: CustomNodeType[];
  edges: Edge[];
  exportedAt: string;
}

export interface FieldType {
  value: string;
  label: string;
  description: string;
}

export const FIELD_TYPES: FieldType[] = [
  { value: 'int', label: 'Integer', description: 'Whole numbers' },
  { value: 'varchar', label: 'Varchar', description: 'Variable-length strings' },
  { value: 'text', label: 'Text', description: 'Long text content' },
  { value: 'decimal', label: 'Decimal', description: 'Fixed-point numbers' },
  { value: 'date', label: 'Date', description: 'Date values' },
  { value: 'timestamp', label: 'Timestamp', description: 'Date and time values' },
  { value: 'boolean', label: 'Boolean', description: 'True/false values' },
  { value: 'json', label: 'JSON', description: 'JSON data' },
  { value: 'uuid', label: 'UUID', description: 'Unique identifiers' },
  { value: 'blob', label: 'Blob', description: 'Binary large objects' }
];
