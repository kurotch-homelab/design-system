'use client';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { cx, useControllable, useForma } from './provider.js';
import { Button, EmptyState } from './primitives.js';
import { Checkbox, SearchField } from './fields.js';
import { Pagination, Popover } from './navigation.js';

export interface DataColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => string | number | null | undefined;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right';
}
export interface SortDescriptor {
  key: string;
  direction: 'ascending' | 'descending';
}
export interface DataTableProps<T> {
  label: string;
  rows: readonly T[];
  columns: readonly DataColumn<T>[];
  getRowId: (row: T) => string;
  getRowLabel?: (row: T) => string;
  searchable?: boolean;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  filter?: (row: T) => boolean;
  toolbar?: ReactNode;
  sort?: SortDescriptor | null;
  defaultSort?: SortDescriptor | null;
  onSortChange?: (sort: SortDescriptor) => void;
  page?: number;
  defaultPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  selectable?: boolean;
  selectedKeys?: readonly string[];
  defaultSelectedKeys?: readonly string[];
  onSelectionChange?: (keys: string[]) => void;
  columnVisibility?: boolean;
  visibleColumns?: readonly string[];
  defaultVisibleColumns?: readonly string[];
  onVisibleColumnsChange?: (keys: string[]) => void;
  emptyTitle?: string;
  className?: string;
}
export function DataTable<T>({
  label,
  rows,
  columns,
  getRowId,
  getRowLabel,
  searchable = true,
  query: queryProp,
  defaultQuery = '',
  onQueryChange,
  filter,
  toolbar,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  page: pageProp,
  defaultPage = 1,
  pageSize = 10,
  onPageChange,
  selectable = false,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectionChange,
  columnVisibility = true,
  visibleColumns,
  defaultVisibleColumns,
  onVisibleColumnsChange,
  emptyTitle,
  className,
}: DataTableProps<T>) {
  const { t, locale } = useForma();
  const id = useId();
  const [query, setQuery] = useControllable(queryProp, defaultQuery, onQueryChange);
  const [sort, setSort] = useControllable<SortDescriptor | null>(sortProp, defaultSort, (next) => {
    if (next) onSortChange?.(next);
  });
  const [requestedPage, setPage] = useControllable(pageProp, defaultPage, onPageChange);
  const [selected, setSelected] = useControllable<readonly string[]>(
    selectedKeys,
    defaultSelectedKeys,
    (next) => onSelectionChange?.([...next]),
  );
  const [visible, setVisible] = useControllable<readonly string[]>(
    visibleColumns,
    defaultVisibleColumns ?? columns.map((c) => c.key),
    (next) => onVisibleColumnsChange?.([...next]),
  );
  const shown = columns.filter((c) => visible.includes(c.key));
  // A stale visibility configuration must never create a table without columns.
  const activeColumns = shown.length ? shown : columns.slice(0, 1);
  const filtered = rows.filter(
    (row) =>
      (!filter || filter(row)) &&
      (!query.trim() ||
        columns.some((column) =>
          String(column.accessor(row) ?? '')
            .toLocaleLowerCase(locale)
            .includes(query.trim().toLocaleLowerCase(locale)),
        )),
  );
  const sorted = [...filtered];
  const sortColumn = columns.find((c) => c.key === sort?.key);
  if (sort && sortColumn && sortColumn.sortable !== false) {
    const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
    sorted.sort((a, b) => {
      const x = sortColumn.accessor(a) ?? '',
        y = sortColumn.accessor(b) ?? '';
      return (
        (typeof x === 'number' && typeof y === 'number'
          ? x - y
          : collator.compare(String(x), String(y))) * (sort.direction === 'ascending' ? 1 : -1)
      );
    });
  }
  const size = Math.max(1, Math.floor(pageSize)),
    page = Math.max(1, Math.min(requestedPage, Math.max(1, Math.ceil(sorted.length / size))));
  const current = sorted.slice((page - 1) * size, page * size),
    currentIds = current.map(getRowId);
  const selectedSet = new Set(selected),
    selectedCount = rows.filter((row) => selectedSet.has(getRowId(row))).length;
  const checkedCount = currentIds.filter((key) => selectedSet.has(key)).length;
  function selectPage(checked: boolean) {
    const next = new Set(selected);
    currentIds.forEach((key) => (checked ? next.add(key) : next.delete(key)));
    setSelected([...next]);
  }
  return (
    <div className={cx('f-data-table', className)}>
      <div className="f-table-toolbar">
        {searchable && (
          <SearchField
            label={t('表を検索', 'Search table')}
            placeholder={t('検索…', 'Search…')}
            value={query}
            onValueChange={(next) => {
              setQuery(next);
              setPage(1);
            }}
          />
        )}
        <div className="f-table-actions">
          {toolbar}
          {columnVisibility && (
            <Popover label={t('表示する列', 'Visible columns')}>
              <div className="f-react-stack">
                {columns.map((column) => (
                  <Checkbox
                    key={column.key}
                    label={column.header}
                    checked={activeColumns.some((c) => c.key === column.key)}
                    disabled={activeColumns.length === 1 && activeColumns[0].key === column.key}
                    onCheckedChange={(checked) =>
                      setVisible(
                        checked
                          ? [...activeColumns.map((c) => c.key), column.key]
                          : activeColumns.filter((c) => c.key !== column.key).map((c) => c.key),
                      )
                    }
                  />
                ))}
              </div>
            </Popover>
          )}
        </div>
      </div>
      {selectable && (
        <div className="f-selection">
          <span role="status">{t(`${selectedCount}件選択`, `${selectedCount} selected`)}</span>
          <Button
            size="sm"
            variant="ghost"
            disabled={!selectedCount}
            onClick={() => setSelected([])}
          >
            {t('選択を解除', 'Clear selection')}
          </Button>
        </div>
      )}
      <div className="f-table-scroll" role="region" aria-label={label} tabIndex={0}>
        <table>
          <caption className="f-sr-only">{label}</caption>
          <thead>
            <tr>
              {selectable && (
                <th className="f-selection-col" scope="col">
                  <Checkbox
                    label={
                      <span className="f-sr-only">
                        {t('このページをすべて選択', 'Select all on this page')}
                      </span>
                    }
                    disabled={!currentIds.length}
                    checked={currentIds.length > 0 && checkedCount === currentIds.length}
                    indeterminate={checkedCount > 0 && checkedCount < currentIds.length}
                    onCheckedChange={selectPage}
                  />
                </th>
              )}
              {activeColumns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={column.align === 'right' ? 'f-number-cell' : undefined}
                  aria-sort={sort?.key === column.key ? sort.direction : undefined}
                >
                  {column.sortable === false ? (
                    column.header
                  ) : (
                    <button
                      type="button"
                      className="f-sort"
                      onClick={() => {
                        setSort({
                          key: column.key,
                          direction:
                            sort?.key === column.key && sort.direction === 'ascending'
                              ? 'descending'
                              : 'ascending',
                        });
                        setPage(1);
                      }}
                    >
                      {column.header}
                      <span aria-hidden="true">
                        {sort?.key === column.key
                          ? sort.direction === 'ascending'
                            ? '↑'
                            : '↓'
                          : '↕'}
                      </span>
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {current.map((row) => {
              const key = getRowId(row);
              return (
                <tr key={key} data-selected={selectedSet.has(key) ? '' : undefined}>
                  {selectable && (
                    <td>
                      <Checkbox
                        label={
                          <span className="f-sr-only">
                            {t(
                              `${getRowLabel?.(row) ?? key}を選択`,
                              `Select ${getRowLabel?.(row) ?? key}`,
                            )}
                          </span>
                        }
                        checked={selectedSet.has(key)}
                        onCheckedChange={(checked) =>
                          setSelected(
                            checked
                              ? [...new Set([...selected, key])]
                              : selected.filter((x) => x !== key),
                          )
                        }
                      />
                    </td>
                  )}
                  {activeColumns.map((column) => (
                    <td
                      key={column.key}
                      className={column.align === 'right' ? 'f-number-cell' : undefined}
                    >
                      {column.render ? column.render(row) : column.accessor(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {!current.length && (
              <tr>
                <td colSpan={Math.max(1, activeColumns.length + (selectable ? 1 : 0))}>
                  <EmptyState
                    title={emptyTitle ?? t('該当するデータがありません', 'No matching data')}
                    description={t(
                      '検索条件を変更してください。',
                      'Try changing your search or filters.',
                    )}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="f-table-footer">
        <span id={`${id}-results`} role="status">
          {t(
            `${sorted.length}件中 ${sorted.length ? (page - 1) * size + 1 : 0}–${Math.min(page * size, sorted.length)}件`,
            `${sorted.length ? (page - 1) * size + 1 : 0}–${Math.min(page * size, sorted.length)} of ${sorted.length}`,
          )}
        </span>
        <Pagination
          label={t(`${label}のページ切り替え`, `${label} pagination`)}
          total={sorted.length}
          pageSize={size}
          page={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
