import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Entity } from '../lib/types.ts';
import { Icon, TYPE_LABELS } from './ui.tsx';

interface Props {
  query: string;
  matches: Entity[];
  onQuery: (query: string) => void;
  onSelect: (id: string) => void;
}

export function EntitySearch({ query, matches, onQuery, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const listId = useId();
  const expanded = open && !!query.trim() && matches.length > 0;
  const activeIndex = Math.min(active, Math.max(matches.length - 1, 0));
  const shortcut = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';

  useLayoutEffect(() => {
    const list = results.current;
    const option = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!list || !option) return;
    const bounds = list.getBoundingClientRect();
    const row = option.getBoundingClientRect();
    const top = bounds.top + list.clientTop;
    const bottom = top + list.clientHeight;
    // Scroll only the results container; selecting an option must not move the page.
    if (row.top < top) list.scrollTop -= top - row.top;
    else if (row.bottom > bottom) list.scrollTop += row.bottom - bottom;
  }, [expanded, activeIndex, matches]);

  useEffect(() => {
    const focusSearch = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && input.current?.getClientRects().length) {
        event.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  function choose(entity: Entity) {
    onSelect(entity.id);
    onQuery('');
    setOpen(false);
    if (matchMedia('(pointer: coarse)').matches) input.current?.blur();
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onQuery('');
      setOpen(false);
    } else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && matches.length && query.trim()) {
      event.preventDefault();
      setOpen(true);
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActive(open ? (activeIndex + direction + matches.length) % matches.length : 0);
    } else if (event.key === 'Enter' && query.trim() && matches.length) {
      event.preventDefault();
      choose(matches[activeIndex]);
    }
  }

  return (
    <div className="search-control">
      <div className="search-field">
        <Icon name="search" size={20} />
        <input ref={input} type="search" role="combobox" aria-label="Search entities"
          aria-autocomplete="list" aria-expanded={expanded} aria-controls={listId}
          aria-activedescendant={expanded ? `${listId}-${activeIndex}` : undefined}
          placeholder="Search by name" autoComplete="off" spellCheck={false} maxLength={256}
          value={query} onKeyDown={keyDown} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
          onChange={(event) => { onQuery(event.target.value); setActive(0); setOpen(true); }} />
        {query ? (
          <button className="icon-button search-clear" aria-label="Clear search"
            onMouseDown={(event) => event.preventDefault()} onClick={() => { onQuery(''); input.current?.focus(); }}>
            <Icon name="close" size={16} />
          </button>
        ) : <kbd>{shortcut}</kbd>}
      </div>
      {expanded && (
        <div id={listId} ref={results} className="search-results" role="listbox" aria-label="Search results">
          {matches.map((entity, index) => (
            <button key={entity.id} id={`${listId}-${index}`} type="button" role="option" tabIndex={-1}
              aria-selected={index === activeIndex} onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => setActive(index)} onClick={() => choose(entity)}>
              <span className={`type-dot ${entity.type}`} />
              <span>{entity.label}</span>
              <small>{TYPE_LABELS[entity.type]}</small>
              <Icon name="arrow" size={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
