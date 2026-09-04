import * as React from 'react';
import type {
  CheckboxProps,
  CommonFieldProps,
  DatePickerProps,
  InputProps,
  SelectProps,
  TextareaProps,
} from './types.js';
import { getToneTokenSet } from './status.js';

const classes = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(' ');

const describedByIds = (
  id: string,
  help: React.ReactNode,
  validation: CommonFieldProps['validation'],
  nativeDescription?: string
): string | undefined =>
  [
    nativeDescription,
    help ? `${id}-description` : undefined,
    validation?.message ? validation.id ?? `${id}-validation` : undefined,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

const RequiredIndicator = ({
  required,
  children,
}: {
  required: boolean | undefined;
  children: React.ReactNode;
}) =>
  required && children !== null ? (
    children ?? (
      <span className="oods-field-required form-field__required-indicator" aria-hidden="true">
        *
      </span>
    )
  ) : null;

type FieldFrameProps = CommonFieldProps & {
  readonly required?: boolean;
  readonly checkboxControl?: React.ReactNode;
  readonly children?: React.ReactNode;
};

const FieldFrame = ({
  id,
  label,
  help,
  description,
  validation,
  density = 'comfortable',
  required,
  requiredIndicator,
  checkboxControl,
  className,
  style,
  children,
}: FieldFrameProps) => {
  const resolvedHelp = help ?? description;
  const validationTone = validation?.state === 'error'
    ? 'critical'
    : validation?.state === 'warning'
      ? 'warning'
      : validation?.state;
  const validationTokens = validationTone ? getToneTokenSet(validationTone) : undefined;
  const validationStyle = validationTokens
    ? {
        '--cmp-input-message-border': validationTokens.border,
        '--cmp-input-message-text': validationTokens.foreground,
        '--form-field-border': validationTokens.border,
        '--form-field-border-active': validationTokens.border,
        '--form-field-background-active': validationTokens.background,
        '--form-field-validation-color': validationTokens.foreground,
        '--form-field-focus-inner': validationTokens.border,
        '--form-field-focus-outer': validationTokens.background,
        '--form-field-accent': validationTokens.foreground,
      }
    : {};
  return (
    <div
      className={classes(
        'oods-field',
        'form-field',
        checkboxControl !== undefined && 'oods-checkbox',
        className
      )}
      style={{ ...validationStyle, ...style } as React.CSSProperties}
      data-density={density}
      data-validation-state={validation?.state}
    >
      <label
        className="form-field__label"
        htmlFor={id}
      >
        {checkboxControl}
        <span className="oods-field-label">{label}</span>
        <RequiredIndicator required={required}>{requiredIndicator}</RequiredIndicator>
      </label>
      {checkboxControl === undefined ? <div className="form-field__control">{children}</div> : null}
      {resolvedHelp ? (
        <p id={`${id}-description`} className="oods-field-help form-field__description">
          {resolvedHelp}
        </p>
      ) : null}
      {validation?.message ? (
        <p
          id={validation.id ?? `${id}-validation`}
          className="oods-field-error form-field__validation"
          role={validation.state === 'error' ? 'alert' : 'status'}
          aria-live={validation.state === 'error' ? 'assertive' : 'polite'}
          data-state={validation.state}
        >
          {validation.message}
        </p>
      ) : null}
    </div>
  );
};

const InputPrimitive = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      help,
      description,
      validation,
      density,
      requiredIndicator,
      className,
      style,
      inputClassName,
      inputStyle,
      onChange,
      onInput,
      onValueChange,
      onUpdate,
      required,
      'aria-describedby': nativeDescription,
      type = 'text',
      ...rest
    },
    ref
  ) => {
    const resolvedHelp = help ?? description;
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
      onChange?.(event);
      if (!event.defaultPrevented) {
        onValueChange?.(event.currentTarget.value);
        onUpdate?.(event.currentTarget.value);
      }
    };
    return (
      <FieldFrame
        id={id}
        label={label}
        help={resolvedHelp}
        validation={validation}
        density={density}
        required={required}
        requiredIndicator={requiredIndicator}
        className={className}
        style={style}
      >
        <input
          ref={ref}
          id={id}
          type={type}
          className={classes('oods-field-control', 'form-field__input', inputClassName)}
          style={inputStyle}
          data-oods-component="Input"
          data-validation-state={validation?.state}
          aria-describedby={describedByIds(id, resolvedHelp, validation, nativeDescription)}
          aria-invalid={validation?.state === 'error' || undefined}
          required={required}
          onInput={onInput}
          onChange={handleChange}
          {...rest}
        />
      </FieldFrame>
    );
  }
);
InputPrimitive.displayName = 'OODS.Input';

export const Input = InputPrimitive;

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ pickerClassName, pickerStyle, inputClassName, inputStyle, ...rest }, ref) => (
    <Input
      ref={ref}
      type="date"
      data-oods-component="DatePicker"
      inputClassName={classes('form-field__date-picker', inputClassName, pickerClassName)}
      inputStyle={{ ...inputStyle, ...pickerStyle }}
      {...rest}
    />
  )
);
DatePicker.displayName = 'OODS.DatePicker';

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      label,
      help,
      description,
      validation,
      density,
      requiredIndicator,
      className,
      style,
      checkboxClassName,
      checkboxStyle,
      onChange,
      onCheckedChange,
      onUpdate,
      required,
      'aria-describedby': nativeDescription,
      ...rest
    },
    ref
  ) => {
    const resolvedHelp = help ?? description;
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
      onChange?.(event);
      if (!event.defaultPrevented) {
        onCheckedChange?.(event.currentTarget.checked);
        onUpdate?.(event.currentTarget.checked);
      }
    };
    const control = (
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={classes('form-field__checkbox', checkboxClassName)}
        style={checkboxStyle}
        data-oods-component="Checkbox"
        data-validation-state={validation?.state}
        aria-describedby={describedByIds(id, resolvedHelp, validation, nativeDescription)}
        aria-invalid={validation?.state === 'error' || undefined}
        required={required}
        onChange={handleChange}
        {...rest}
      />
    );
    return (
      <FieldFrame
        id={id}
        label={label}
        help={resolvedHelp}
        validation={validation}
        density={density}
        required={required}
        requiredIndicator={requiredIndicator}
        checkboxControl={control}
        className={className}
        style={style}
      />
    );
  }
);
Checkbox.displayName = 'OODS.Checkbox';

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      help,
      description,
      validation,
      density,
      requiredIndicator,
      className,
      style,
      options,
      selectClassName,
      selectStyle,
      onChange,
      onValueChange,
      onUpdate,
      children,
      required,
      'aria-describedby': nativeDescription,
      ...rest
    },
    ref
  ) => {
    const resolvedHelp = help ?? description;
    const handleChange: React.ChangeEventHandler<HTMLSelectElement> = event => {
      onChange?.(event);
      if (!event.defaultPrevented) {
        onValueChange?.(event.currentTarget.value);
        onUpdate?.(event.currentTarget.value);
      }
    };
    return (
      <FieldFrame
        id={id}
        label={label}
        help={resolvedHelp}
        validation={validation}
        density={density}
        required={required}
        requiredIndicator={requiredIndicator}
        className={className}
        style={style}
      >
        <select
          ref={ref}
          id={id}
          className={classes('oods-field-control', 'form-field__select', selectClassName)}
          style={selectStyle}
          data-oods-component="Select"
          data-validation-state={validation?.state}
          aria-describedby={describedByIds(id, resolvedHelp, validation, nativeDescription)}
          aria-invalid={validation?.state === 'error' || undefined}
          required={required}
          onChange={handleChange}
          {...rest}
        >
          {children ??
            options?.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
        </select>
      </FieldFrame>
    );
  }
);
Select.displayName = 'OODS.Select';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      help,
      description,
      validation,
      density,
      requiredIndicator,
      className,
      style,
      textareaClassName,
      textareaStyle,
      onChange,
      onInput,
      onValueChange,
      onUpdate,
      rows = 4,
      required,
      'aria-describedby': nativeDescription,
      ...rest
    },
    ref
  ) => {
    const resolvedHelp = help ?? description;
    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = event => {
      onChange?.(event);
      if (!event.defaultPrevented) {
        onValueChange?.(event.currentTarget.value);
        onUpdate?.(event.currentTarget.value);
      }
    };
    return (
      <FieldFrame
        id={id}
        label={label}
        help={resolvedHelp}
        validation={validation}
        density={density}
        required={required}
        requiredIndicator={requiredIndicator}
        className={className}
        style={style}
      >
        <textarea
          ref={ref}
          id={id}
          className={classes(
            'oods-field-control',
            'form-field__input',
            'form-field__textarea',
            textareaClassName
          )}
          style={textareaStyle}
          data-oods-component="Textarea"
          data-validation-state={validation?.state}
          aria-describedby={describedByIds(id, resolvedHelp, validation, nativeDescription)}
          aria-invalid={validation?.state === 'error' || undefined}
          rows={rows}
          required={required}
          onInput={onInput}
          onChange={handleChange}
          {...rest}
        />
      </FieldFrame>
    );
  }
);
Textarea.displayName = 'OODS.Textarea';
