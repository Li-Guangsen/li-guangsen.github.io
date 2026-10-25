'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { site } from '@/data/site';
import { GitHubIcon, MailIcon, WeChatIcon } from './social-icons';

export function ContactMenu({ inline = false }: { inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open || inline) return;
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false); };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open, inline]);

  async function copyWechat() {
    try { await navigator.clipboard.writeText(site.wechat); setCopyStatus('微信号已复制'); }
    catch { setCopyStatus(`微信号：${site.wechat}`); }
  }

  return <div className={`contact-menu${inline ? ' contact-inline' : ''}`} ref={container} onBlur={(event) => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    {!inline && <button ref={trigger} type="button" className="contact-trigger" aria-expanded={open} aria-controls={id} onClick={() => { setOpen(!open); setCopyStatus(''); }}>Contact</button>}
    {(inline || open) && <div id={id} className="contact-panel" role="region" aria-label={inline ? '移动端联系方式' : '联系方式'}>
      {inline && <p className="contact-label">Contact</p>}
      <a href={site.github} target="_blank" rel="noopener noreferrer"><GitHubIcon /><span>GitHub</span><span className="contact-value">↗</span></a>
      <button type="button" onClick={() => void copyWechat()} aria-label="复制微信号"><WeChatIcon /><span>WeChat</span><span className="contact-value">{site.wechat}</span></button>
      <a href={`mailto:${site.email}`}><MailIcon /><span>Email</span><span className="contact-value">↗</span></a>
      {copyStatus && <p className="contact-status" role="status">{copyStatus}</p>}
    </div>}
  </div>;
}
