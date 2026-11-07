export const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export const validRange = (start, end) => !start || !end || start <= end;
export const validFile = (file, accept = '.pdf', maxSize = 5 * 1024 * 1024) =>
  file.size <= maxSize &&
  accept.split(',').some((item) => {
    const a = item.trim().toLowerCase();
    return a.startsWith('.')
      ? file.name.toLowerCase().endsWith(a)
      : a.endsWith('/*')
        ? file.type.startsWith(a.slice(0, -1))
        : file.type === a;
  });
export function selectRows(rows, query, sort, locale) {
  const filtered = rows.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)),
    ),
  );
  if (sort)
    filtered.sort(
      (a, b) =>
        sort.direction *
        (typeof a[sort.key] === 'number'
          ? a[sort.key] - b[sort.key]
          : String(a[sort.key]).localeCompare(String(b[sort.key]), locale, { numeric: true })),
    );
  return filtered;
}
export const button = (label, action = '', variant = 'secondary', attrs = '') =>
  `<button type="button" class="f-button f-button--${variant}" ${action ? `data-action="${action}"` : ''} ${attrs}>${label}</button>`;
export const badge = (label, tone = 'neutral') =>
  `<span class="f-badge f-tone-${tone}">${escapeHTML(label)}</span>`;
export const field = (id, label, type = 'text', attrs = '') =>
  `<div class="f-field"><label for="${id}">${escapeHTML(label)}</label><input class="f-input" id="${id}" type="${type}" ${attrs}></div>`;
export const check = (label, attrs = '') =>
  `<label class="f-check"><input type="checkbox" ${attrs}><span>${escapeHTML(label)}</span></label>`;
