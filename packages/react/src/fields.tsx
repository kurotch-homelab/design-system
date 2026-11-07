'use client';
import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { assignRef, cx, useControllable, useForma, useFormReset } from './provider.js';
import { Button } from './primitives.js';

export interface FieldProps {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
}
function Field({
  id,
  label,
  description,
  error,
  wrapperClassName,
  children,
}: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className={cx('f-field', wrapperClassName)} data-invalid={error ? '' : undefined}>
      <label htmlFor={id}>{label}</label>
      {children}
      {description && (
        <span id={`${id}-help`} className="f-help">
          {description}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className="f-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
function descriptionId(id: string, description: ReactNode, error: ReactNode, existing?: string) {
  return cx(existing, !!description && `${id}-help`, !!error && `${id}-error`) || undefined;
}
export interface TextFieldProps
  extends FieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onValueChange?: (value: string) => void;
}
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    description,
    error,
    wrapperClassName,
    id: provided,
    className,
    onChange,
    onValueChange,
    ...props
  },
  ref,
) {
  const generated = useId(),
    id = provided ?? generated;
  return (
    <Field {...{ id, label, description, error, wrapperClassName }}>
      <input
        type="text"
        {...props}
        id={id}
        ref={ref}
        className={cx('f-input', className)}
        aria-invalid={!!error || props['aria-invalid']}
        aria-describedby={descriptionId(id, description, error, props['aria-describedby'])}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
      />
    </Field>
  );
});
export interface TextAreaProps extends FieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (value: string) => void;
}
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label,
    description,
    error,
    wrapperClassName,
    id: provided,
    className,
    onChange,
    onValueChange,
    ...props
  },
  ref,
) {
  const generated = useId(),
    id = provided ?? generated;
  return (
    <Field {...{ id, label, description, error, wrapperClassName }}>
      <textarea
        rows={4}
        {...props}
        ref={ref}
        id={id}
        className={cx('f-input', 'f-textarea', className)}
        aria-invalid={!!error || props['aria-invalid']}
        aria-describedby={descriptionId(id, description, error, props['aria-describedby'])}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
      />
    </Field>
  );
});
export interface NumberFieldProps extends Omit<
  TextFieldProps,
  'type' | 'value' | 'defaultValue' | 'onValueChange'
> {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
}
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  { value, defaultValue, onValueChange, onChange, ...props },
  ref,
) {
  return (
    <TextField
      {...props}
      ref={ref}
      type="number"
      value={value === null ? '' : value}
      defaultValue={defaultValue ?? undefined}
      onChange={(event) => {
        onChange?.(event);
        const n = event.target.valueAsNumber;
        onValueChange?.(Number.isFinite(n) ? n : null);
      }}
    />
  );
});
export const SearchField = forwardRef<HTMLInputElement, Omit<TextFieldProps, 'type'>>(
  function SearchField({ wrapperClassName, ...props }, ref) {
    return (
      <TextField
        {...props}
        type="search"
        ref={ref}
        wrapperClassName={cx('f-search', wrapperClassName)}
      />
    );
  },
);
export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  label: ReactNode;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, indeterminate = false, onCheckedChange, onChange, className, ...props },
  forwarded,
) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label className={cx('f-check', className)}>
      <input
        {...props}
        ref={(node) => {
          ref.current = node;
          assignRef(forwarded, node);
        }}
        type="checkbox"
        onChange={(event) => {
          onChange?.(event);
          onCheckedChange?.(event.target.checked);
        }}
      />
      {label}
    </label>
  );
});
export const Switch = forwardRef<HTMLInputElement, Omit<CheckboxProps, 'indeterminate'>>(
  function Switch({ label, onCheckedChange, onChange, className, ...props }, ref) {
    return (
      <label className={cx('f-switch', className)}>
        <input
          {...props}
          ref={ref}
          role="switch"
          type="checkbox"
          onChange={(event) => {
            onChange?.(event);
            onCheckedChange?.(event.target.checked);
          }}
        />
        <span className="f-switch-track" aria-hidden="true">
          <span />
        </span>
        {label}
      </label>
    );
  },
);
export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface RadioGroupProps extends FieldProps {
  options: readonly Option[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}
export function RadioGroup({
  label,
  description,
  error,
  options,
  value,
  defaultValue,
  onValueChange,
  name: providedName,
  disabled,
  required,
  id: provided,
  className,
  wrapperClassName,
}: RadioGroupProps) {
  const generated = useId(),
    id = provided ?? generated,
    name = providedName ?? generated;
  return (
    <fieldset
      id={id}
      className={cx('f-fieldset', 'f-field', wrapperClassName, className)}
      disabled={disabled}
      aria-invalid={!!error || undefined}
      aria-describedby={descriptionId(id, description, error)}
    >
      <legend>{label}</legend>
      <div className="f-options">
        {options.map((option) => (
          <label className="f-radio" key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              disabled={option.disabled}
              required={required}
              checked={value === undefined ? undefined : value === option.value}
              defaultChecked={value === undefined ? defaultValue === option.value : undefined}
              onChange={() => onValueChange?.(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      {description && (
        <span id={`${id}-help`} className="f-help">
          {description}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className="f-error" role="alert">
          {error}
        </span>
      )}
    </fieldset>
  );
}
export interface SelectProps
  extends FieldProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'multiple'> {
  options: readonly Option[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    description,
    error,
    wrapperClassName,
    id: provided,
    className,
    options,
    placeholder,
    onChange,
    onValueChange,
    ...props
  },
  ref,
) {
  const generated = useId(),
    id = provided ?? generated;
  return (
    <Field {...{ id, label, description, error, wrapperClassName }}>
      <select
        {...props}
        id={id}
        ref={ref}
        className={cx('f-input', className)}
        aria-invalid={!!error || props['aria-invalid']}
        aria-describedby={descriptionId(id, description, error, props['aria-describedby'])}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
});
export interface ComboBoxProps extends Omit<TextFieldProps, 'list' | 'type'> {
  options: readonly Option[];
}
export const ComboBox = forwardRef<HTMLInputElement, ComboBoxProps>(function ComboBox(
  { options, ...props },
  ref,
) {
  const listId = useId();
  return (
    <>
      <TextField {...props} ref={ref} list={listId} />
      <datalist id={listId}>
        {options
          .filter((o) => !o.disabled)
          .map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
      </datalist>
    </>
  );
});
export type DatePickerProps = Omit<TextFieldProps, 'type' | 'value' | 'defaultValue'> & {
  value?: string;
  defaultValue?: string;
};
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const { locale } = useForma();
    return <TextField {...props} ref={ref} type="date" lang={locale} />;
  },
);
export interface DateRange {
  start: string;
  end: string;
}
export interface DateRangePickerProps extends FieldProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange) => void;
  startLabel?: string;
  endLabel?: string;
  name?: string;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}
export function DateRangePicker({
  label,
  description,
  error,
  value,
  defaultValue = { start: '', end: '' },
  onValueChange,
  startLabel,
  endLabel,
  name,
  min,
  max,
  required,
  disabled,
  className,
  wrapperClassName,
}: DateRangePickerProps) {
  const [range, setRange] = useControllable(value, defaultValue, onValueChange);
  const { t } = useForma();
  const id = useId(),
    ref = useRef<HTMLFieldSetElement>(null),
    endRef = useRef<HTMLInputElement>(null);
  const invalid = !!(range.start && range.end && range.end < range.start);
  const issue =
    error ||
    (invalid
      ? t('終了日は開始日以降を指定してください。', 'End date must be on or after the start date.')
      : undefined);
  useEffect(() => {
    endRef.current?.setCustomValidity(
      invalid ? t('日付の範囲を確認してください。', 'Check the date range.') : '',
    );
  }, [invalid, t]);
  useFormReset(ref, () => {
    if (value === undefined) setRange(defaultValue);
  });
  return (
    <fieldset
      ref={ref}
      className={cx('f-fieldset', 'f-field', wrapperClassName, className)}
      disabled={disabled}
      aria-describedby={descriptionId(id, description, issue)}
    >
      <legend>{label}</legend>
      <div className="native-date-range">
        <DatePicker
          label={startLabel ?? t('開始日', 'Start date')}
          name={name && `${name}.start`}
          value={range.start}
          min={min}
          max={max}
          required={required}
          onValueChange={(start) => setRange({ ...range, start })}
        />
        <DatePicker
          ref={endRef}
          label={endLabel ?? t('終了日', 'End date')}
          name={name && `${name}.end`}
          value={range.end}
          min={min}
          max={max}
          required={required}
          aria-invalid={!!issue}
          aria-describedby={issue ? `${id}-error` : undefined}
          onValueChange={(end) => setRange({ ...range, end })}
        />
      </div>
      {description && (
        <span className="f-help" id={`${id}-help`}>
          {description}
        </span>
      )}
      {issue && (
        <span className="f-error" role="alert" id={`${id}-error`}>
          {issue}
        </span>
      )}
    </fieldset>
  );
}
export interface SliderProps extends Omit<
  TextFieldProps,
  'type' | 'value' | 'defaultValue' | 'onValueChange'
> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { value, defaultValue = 50, onValueChange, onChange, ...props },
  ref,
) {
  return (
    <TextField
      {...props}
      ref={ref}
      type="range"
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.target.valueAsNumber);
      }}
    />
  );
});
export interface FileUploadProps extends FieldProps {
  value?: readonly File[];
  defaultValue?: readonly File[];
  onValueChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxBytes?: number;
  maxFiles?: number;
  disabled?: boolean;
  onReject?: (message: string) => void;
  className?: string;
  id?: string;
}
export function FileUpload({
  label,
  description,
  error,
  value,
  defaultValue = [],
  onValueChange,
  accept,
  multiple,
  maxBytes,
  maxFiles,
  disabled,
  onReject,
  className,
  wrapperClassName,
  id: provided,
}: FileUploadProps) {
  const generated = useId(),
    id = provided ?? generated;
  const [files, setFiles] = useControllable<readonly File[]>(value, defaultValue, (next) =>
    onValueChange?.([...next]),
  );
  const [rejection, setRejection] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const { t } = useForma();
  useFormReset(ref, () => {
    if (value === undefined) setFiles(defaultValue);
    setRejection('');
  });
  function select(next: File[]) {
    const rules =
      accept
        ?.split(',')
        .map((rule) => rule.trim().toLowerCase())
        .filter(Boolean) ?? [];
    let message = '';
    if (maxFiles && next.length > maxFiles)
      message = t(`ファイルは${maxFiles}件まで選べます。`, `Choose at most ${maxFiles} files.`);
    for (const file of next) {
      if (maxBytes !== undefined && file.size > maxBytes)
        message = t(
          `「${file.name}」のサイズが上限を超えています。`,
          `“${file.name}” exceeds the size limit.`,
        );
      if (
        rules.length &&
        !rules.some((rule) =>
          rule.startsWith('.')
            ? file.name.toLowerCase().endsWith(rule)
            : rule.endsWith('/*')
              ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
              : file.type.toLowerCase() === rule,
        )
      )
        message = t(
          `「${file.name}」は選択できない形式です。`,
          `“${file.name}” is not an accepted file type.`,
        );
    }
    setRejection(message);
    if (message) onReject?.(message);
    else setFiles(next);
  }
  return (
    <Field {...{ id, label, description, wrapperClassName }} error={error || rejection}>
      <div className={cx('f-upload', className)}>
        <input
          id={id}
          ref={ref}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-invalid={!!(error || rejection)}
          aria-describedby={descriptionId(id, description, error || rejection)}
          onChange={(event) => {
            const next = Array.from(event.target.files ?? []);
            if (next.length) select(next);
            event.target.value = '';
          }}
        />
        <ul className="f-file-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`}>
              <span>
                {file.name} <small>({Math.ceil(file.size / 1024)} KB)</small>
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={disabled}
                aria-label={t(`${file.name}を解除`, `Remove ${file.name}`)}
                onClick={() => {
                  setFiles(files.filter((_, i) => i !== index));
                  setRejection('');
                }}
              >
                {t('解除', 'Remove')}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </Field>
  );
}
