import { ArrowRight, ChevronLeft, ChevronRight, Maximize, Minimize, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { sfx } from '../audio/sound';
import { useVnSettings } from '../store/settingsStore';

export function Action({ tone = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'secondary' | 'quiet' }) {
  return <button type="button" className={`pp-button pp-button--${tone} ${className}`} {...props} />;
}

export function Next({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Action tone="primary" {...props}>{children}<ArrowRight aria-hidden="true" size={17} /></Action>;
}

export function Brand() {
  return <div className="pp-brand"><span className="pp-mark" aria-hidden="true" /><span><strong>破壁行动</strong><small>PROJECT PHANTOM</small></span></div>;
}

export function Settings() {
  const { muted, reduceMotion, setMuted, setReduceMotion } = useVnSettings();
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));
  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  return <div className="pp-settings">
    <button className="pp-icon-button" aria-label="消息提示音" aria-pressed={!muted} title={muted ? '开启提示音' : '关闭提示音'} onClick={() => { setMuted(!muted); if (muted) sfx.click(); }}>
      {muted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
    </button>
    <button className="pp-icon-button" aria-label="减少动态效果" aria-pressed={reduceMotion} title="减少动态效果" onClick={() => setReduceMotion(!reduceMotion)}><Sparkles size={16} aria-hidden="true" /></button>
    {document.fullscreenEnabled && <button className="pp-icon-button" aria-label={fullscreen ? '退出全屏' : '全屏'} title={fullscreen ? '退出全屏' : '全屏'} onClick={() => {
      const change = fullscreen ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      void change.catch(() => undefined);
    }}>{fullscreen ? <Minimize size={17} aria-hidden="true" /> : <Maximize size={17} aria-hidden="true" />}</button>}
  </div>;
}

export function useLessMotion() {
  const setting = useVnSettings((state) => state.reduceMotion);
  const [system, setSystem] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = (event: MediaQueryListEvent) => setSystem(event.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  return system || setting;
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'good' | 'warning' | 'muted' }) {
  return <span className={`pp-badge pp-badge--${tone}`}>{children}</span>;
}

const readPositions = new Map<string, number>();

function contentPages(viewport: HTMLElement, track: HTMLElement) {
  const height = viewport.clientHeight;
  const last = Math.max(0, track.offsetHeight - height);
  const step = Math.max(1, height - Math.min(72, Math.floor(height * .25)));
  const offsets = [0];
  if (height > 0) {
    for (let offset = step; offset < last; offset += step) offsets.push(offset);
    if (last > 0) offsets.push(last);
  }
  return offsets;
}

export function Modal({ title, onClose, children, wide = false, scrollKey, footer }: {
  title: string; onClose: () => void; children: ReactNode; wide?: boolean; scrollKey?: string; footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [offsets, setOffsets] = useState([0]);
  const [current, setCurrent] = useState(() => scrollKey ? readPositions.get(scrollKey) ?? 0 : 0);

  useLayoutEffect(() => {
    const dialog = ref.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!dialog || !viewport || !track) return;
    if (!dialog.open) dialog.showModal();
    const update = () => {
      const pages = contentPages(viewport, track);
      setOffsets((previous) => pages.length === previous.length && pages.every((page, index) => page === previous[index]) ? previous : pages);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(track);
    observer.observe(viewport);
    return () => { observer.disconnect(); if (dialog.open) dialog.close(); };
  }, []);

  const page = Math.min(current, offsets.length - 1);
  const offset = offsets[page];
  function go(next: number) {
    setCurrent(next);
    if (scrollKey) readPositions.set(scrollKey, next);
  }

  return <dialog ref={ref} className={`pp-modal${wide ? ' pp-modal--wide' : ''}${footer ? ' pp-modal--with-footer' : ''}`} aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="pp-modal-inner">
      <header className="pp-modal-head"><h2 id={titleId}>{title}</h2><button type="button" aria-label="关闭" className="pp-icon-button" onClick={onClose}><X size={19} /></button></header>
      <div ref={viewportRef} className="pp-modal-view" onFocusCapture={(event) => {
        const track = trackRef.current;
        if (!track || !(event.target instanceof HTMLElement) || !event.target.matches(':focus-visible')) return;
        const visible = event.currentTarget.getBoundingClientRect();
        const target = event.target.getBoundingClientRect();
        if (target.top >= visible.top - 1 && target.bottom <= visible.bottom + 1) return;
        const top = target.top - track.getBoundingClientRect().top;
        const next = offsets.findIndex((start) => start > top);
        go(next < 0 ? offsets.length - 1 : Math.max(0, next - 1));
      }}>
        <div ref={trackRef} className="pp-modal-track" style={{ transform: `translateY(${-offset}px)` }}>{children}</div>
      </div>
      {offsets.length > 1 && <nav className="pp-modal-pages" aria-label="翻页">
        <Action disabled={page === 0} onClick={() => go(page - 1)}><ChevronLeft size={16} /> 上一页</Action>
        <span aria-live="polite">{page + 1} / {offsets.length}</span>
        <Action disabled={page + 1 >= offsets.length} onClick={() => go(page + 1)}>下一页 <ChevronRight size={16} /></Action>
      </nav>}
      {footer}
    </div>
  </dialog>;
}
