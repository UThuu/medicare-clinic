import type { ReactNode } from 'react';
import './shared-ui.css';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render?: (row: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  emptyText?: string;
  caption?: string;
}

export function Table<T>({ columns, data, rowKey, emptyText = 'Chưa có dữ liệu', caption }: TableProps<T>) {
  return (
    <div className="mc-table-wrap">
      <table className="mc-table">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>{columns.map((column) => <th key={column.key} style={{ width: column.width, textAlign: column.align ?? 'left' }}>{column.header}</th>)}</tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td className="mc-table__empty" colSpan={columns.length}>{emptyText}</td></tr>
          ) : data.map((row, index) => (
            <tr key={rowKey(row, index)}>{columns.map((column) => <td key={column.key} style={{ textAlign: column.align ?? 'left' }}>{column.render ? column.render(row, index) : String((row as Record<string, unknown>)[column.key] ?? '')}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
