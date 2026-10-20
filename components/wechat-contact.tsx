'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { WeChatIcon } from './social-icons';
import styles from './wechat-contact.module.css';

export function WeChatContact({ account, className }: { account: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const copyButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const panelId = `${id}-wechat`;
  const headingId = `${id}-heading`;

  useEffect(() => {
    if (!open) return;
    copyButton.current?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  }

  return <div className={styles.contact} ref={container} onBlur={(event) => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={trigger} className={className} type="button" title={`微信 · ${account}`} aria-label={`微信 · ${account}`} aria-expanded={open} aria-haspopup="dialog" aria-controls={panelId} onClick={() => {
      setCopied(false);
      setCopyFailed(false);
      setOpen(!open);
    }}><WeChatIcon /></button>
    {open && <div id={panelId} className={styles.panel} role="dialog" aria-labelledby={headingId}>
      <div className={styles.heading}><h2 id={headingId}>微信联系</h2><button className={styles.close} type="button" aria-label="关闭微信联系方式" onClick={() => {
        setOpen(false);
        trigger.current?.focus({ preventScroll: true });
      }}>×</button></div>
      <p className={styles.label}>微信号</p>
      <code className={styles.account}>{account}</code>
      <button ref={copyButton} className={styles.copy} type="button" onClick={() => { void copyAccount(); }}>{copied ? '已复制 ✓' : '复制微信号'}</button>
      <p className={styles.status} aria-live="polite">{copyFailed ? '请选中或长按上方微信号复制。' : copied ? '在微信中搜索此微信号即可添加。' : '在微信中搜索，打个招呼。'}</p>
    </div>}
  </div>;
}
