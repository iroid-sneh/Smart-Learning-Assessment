import React from 'react';
interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}
export function Table<T>({
  data,
  columns,
  keyField,
  actions,
  emptyMessage = 'No data available'
}: TableProps<T>) {
  if (data.length === 0) {
    return <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        {emptyMessage}
      </div>;
  }
  return <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col, index) => <th key={index} className={`py-4 px-4 text-sm font-semibold text-gray-600 ${col.className || ''}`}>
                {col.header}
              </th>)}
            {actions && <th className="py-4 px-4 text-sm font-semibold text-gray-600 text-right">
                Actions
              </th>}
          </tr>
        </thead>
        <tbody>
          {data.map(item => <tr key={String(item[keyField])} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
              {columns.map((col, index) => <td key={index} className="py-4 px-4 text-sm text-gray-800">
                  {typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor] as React.ReactNode}
                </td>)}
              {actions && <td className="py-4 px-4 text-right">{actions(item)}</td>}
            </tr>)}
        </tbody>
      </table>
    </div>;
}