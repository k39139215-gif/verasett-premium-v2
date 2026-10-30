'use client';
import { useId, useRef, useState } from 'react';
import type { AssetProps } from './types';
import { cx, Icon } from './shared';
import base from './assets.module.css';
import s from './source-file-dropzone.module.css';

/**
 * File-size formatting, extension validation, and input/drop wiring adapted from
 * BoardUI's MIT file-upload component. Copyright (c) 2026 Mertcan Dundar Esmergul.
 * See THIRD-PARTY-NOTICES.md. The source's simulated upload was deliberately removed.
 */
const DEFAULT_EXTENSIONS = ['csv', 'xlsx', 'pdf'] as const;
const DEFAULT_MAX_BYTES = 8 * 1024 * 1024;

/** Display metadata only. No File, Blob, contents, or object URL are retained. */
export interface SourceFileMetadata {
  readonly name: string;
  readonly extension: string;
  readonly sizeBytes: number;
  readonly lastModified: number;
}

export interface SourceFileDropzoneProps extends AssetProps {
  /** Receives metadata after selection, or null after removal. No upload occurs. */
  onSelectionChange?: (file: SourceFileMetadata | null) => void;
  /** Case-insensitive filename extensions, optionally prefixed with a dot. */
  allowedExtensions?: readonly string[];
  maxBytes?: number;
  disabled?: boolean;
  label?: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function extensionFor(name: string) {
  const separator = name.lastIndexOf('.');
  return separator > 0 ? name.slice(separator + 1).toLowerCase() : '';
}

/** Local file selection demonstration; does not validate financial evidence. */
export function SourceFileDropzone({
  onSelectionChange, allowedExtensions = DEFAULT_EXTENSIONS, maxBytes = DEFAULT_MAX_BYTES,
  disabled = false, label = 'Select a source file', className, style,
}: SourceFileDropzoneProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const [selection, setSelection] = useState<SourceFileMetadata | null>(null);
  const [rejection, setRejection] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const extensions = [...new Set(allowedExtensions.map(value => value.trim().replace(/^\./, '').toLowerCase()))]
    .filter(value => /^[a-z0-9]+$/.test(value));
  const configured = extensions.length > 0 && Number.isSafeInteger(maxBytes) && maxBytes > 0;
  const unavailable = disabled || !configured;
  const error = configured ? rejection : 'Configure accepted file extensions and a positive maximum file size.';

  function selectFiles(files: FileList | readonly File[] | null) {
    if (unavailable) return;
    if (!files?.length) { setRejection('No file detected. Choose one source file.'); return; }
    if (files.length !== 1) { setRejection('Select one file at a time. No files were added.'); return; }
    const file = files[0];
    const extension = extensionFor(file.name);
    if (!extensions.includes(extension)) {
      setRejection(`Only ${extensions.map(value => value.toUpperCase()).join(', ')} files are supported.`);
      return;
    }
    if (!Number.isSafeInteger(file.size) || file.size <= 0) {
      setRejection('This file is empty. Choose a file with content.'); return;
    }
    if (file.size > maxBytes) {
      setRejection(`This file exceeds the ${formatFileSize(maxBytes)} limit.`); return;
    }
    const metadata: SourceFileMetadata = Object.freeze({
      name: file.name, extension, sizeBytes: file.size, lastModified: file.lastModified,
    });
    setSelection(metadata);
    setRejection('');
    onSelectionChange?.(metadata);
  }

  function removeSelection() {
    setSelection(null);
    setRejection('');
    if (inputRef.current) inputRef.current.value = '';
    onSelectionChange?.(null);
    chooseRef.current?.focus();
  }

  return <section className={cx(base.asset, s.root, className)} style={style} aria-labelledby={`${id}-title`}>
    <div className={s.header}>
      <h3 id={`${id}-title`}>{label}</h3>
      <span className={s.scope}>Local preview</span>
    </div>
    <div className={s.dropzone} data-drag-over={dragOver && !unavailable} data-disabled={unavailable}
      onDragOver={event => { event.preventDefault(); if (!unavailable) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={event => { event.preventDefault(); setDragOver(false); selectFiles(event.dataTransfer.files); }}>
      <span className={s.document}><Icon name="file" /></span>
      <div className={s.instructions}>
        <strong>Drop one source file here</strong>
        <p id={`${id}-formats`}>{configured ? `${extensions.map(value => value.toUpperCase()).join(', ')} · Up to ${formatFileSize(maxBytes)}` : 'File selection unavailable'}</p>
      </div>
      <button ref={chooseRef} className={s.choose} type="button" disabled={unavailable}
        aria-describedby={`${id}-formats ${id}-privacy${error ? ` ${id}-error` : ''}`}
        onClick={() => inputRef.current?.click()}>{selection ? 'Replace file' : 'Choose file'}</button>
      <input ref={inputRef} type="file" className={s.fileInput} tabIndex={-1} disabled={unavailable}
        aria-label={label} aria-describedby={`${id}-formats ${id}-privacy`} aria-invalid={Boolean(error)}
        accept={extensions.map(extension => `.${extension}`).join(',')}
        onChange={event => {
          if (event.target.files?.length) selectFiles(event.target.files);
          event.target.value = '';
        }} />
    </div>
    {error && <p className={s.error} id={`${id}-error`} role="alert"><Icon name="review" />{error}</p>}
    {selection && <div className={s.fileRow}>
      <span className={s.extension} aria-hidden="true">{selection.extension.toUpperCase()}</span>
      <div className={s.fileDetails}>
        <strong title={selection.name}>{selection.name}</strong>
        <p>{selection.extension.toUpperCase()} · {formatFileSize(selection.sizeBytes)} · Selected locally</p>
      </div>
      <span className={s.evidence}><Icon name="clock" />Evidence unverified</span>
      <button className={s.remove} type="button" disabled={disabled} aria-label={`Remove ${selection.name}`} onClick={removeSelection}>Remove</button>
    </div>}
    <p className={s.privacy} id={`${id}-privacy`}>Use fictional test files. Only filename and size are shown; contents are never read or uploaded. Selection does not validate evidence or change reconciliation readiness.</p>
    <span className={s.announcement} role="status">{selection ? `${selection.name} selected locally. Evidence unverified.` : 'No source file selected.'}</span>
  </section>;
}
