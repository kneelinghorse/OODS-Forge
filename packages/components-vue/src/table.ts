import { defineComponent, h, type PropType } from 'vue';

import type { TableColumn, TableRecord } from './types.js';

export const TableCaption = defineComponent({
  name: 'OodsTableCaption',
  setup(_props, { slots }) {
    return () => h('caption', {}, slots.default?.());
  },
});

export const TableHead = defineComponent({
  name: 'OodsTableHead',
  setup(_props, { slots }) {
    return () => h('thead', {}, slots.default?.());
  },
});

export const TableBody = defineComponent({
  name: 'OodsTableBody',
  setup(_props, { slots }) {
    return () => h('tbody', {}, slots.default?.());
  },
});

export const TableRow = defineComponent({
  name: 'OodsTableRow',
  setup(_props, { slots }) {
    return () => h('tr', {}, slots.default?.());
  },
});

export const TableHeaderCell = defineComponent({
  name: 'OodsTableHeaderCell',
  props: {
    scope: { type: String as PropType<'col' | 'row'>, default: 'col' },
  },
  setup(props, { slots }) {
    return () => h('th', { scope: props.scope }, slots.default?.());
  },
});

export const TableCell = defineComponent({
  name: 'OodsTableCell',
  setup(_props, { slots }) {
    return () => h('td', {}, slots.default?.());
  },
});

export const Table = defineComponent({
  name: 'OodsTable',
  props: {
    caption: { type: String, default: '' },
    columns: { type: Array as PropType<readonly TableColumn[]>, default: () => [] },
    rows: { type: Array as PropType<readonly TableRecord[]>, default: () => [] },
    density: { type: String as PropType<'default' | 'compact'>, default: 'default' },
    selectable: Boolean,
  },
  emits: {
    rowActivate: (_rowId: string) => true,
  },
  setup(props, { emit, slots }) {
    const activate = (row: TableRecord) => emit('rowActivate', row.id);
    return () => h('table', {
      class: 'oods-table',
      'data-oods-component': 'Table',
      'data-density': props.density,
    }, [
      h(TableCaption, {}, {
        default: () => slots.caption?.() ?? props.caption,
      }),
      h(TableHead, {}, {
        default: () => slots.head?.() ?? h(TableRow, {}, {
          default: () => props.columns.map((column) => h(TableHeaderCell, { key: column.key }, {
            default: () => slots.headerCell?.({ column }) ?? column.label,
          })),
        }),
      }),
      h(TableBody, {}, {
        default: () => slots.body?.() ?? (
          props.rows.length === 0
            ? h(TableRow, {}, {
                default: () => h(TableCell, {
                  colspan: Math.max(props.columns.length, 1),
                }, {
                  default: () => 'No rows available.',
                }),
              })
            : props.rows.map((row, rowIndex) => (
                slots.row?.({ row, rowIndex, activate: () => activate(row) })
                ?? h(TableRow, { key: row.id }, {
                  default: () => props.columns.map((column, columnIndex) => {
                    const content = slots.cell?.({ row, column, value: row[column.key] })
                      ?? String(row[column.key] ?? '');
                    return h(TableCell, { key: column.key }, {
                      default: () => props.selectable && columnIndex === 0
                        ? h('button', {
                            type: 'button',
                            class: 'oods-table-row-action',
                            onClick: () => activate(row),
                          }, content)
                        : content,
                    });
                  }),
                })
              ))
        ),
      }),
    ]);
  },
});
