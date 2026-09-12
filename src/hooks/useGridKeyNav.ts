import { useCallback, type KeyboardEvent } from 'react';

// Arrow-key focus navigation between <button> cells inside a grid container.
// Attach the returned onKeyDown to the grid container element.
export function useGridKeyNav(cols: number) {
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'BUTTON') return;

      const buttons = Array.from(
        e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])')
      );
      const idx = buttons.indexOf(target as HTMLButtonElement);
      if (idx < 0) return;

      let next = -1;
      if (e.key === 'ArrowRight') next = idx + 1;
      else if (e.key === 'ArrowLeft') next = idx - 1;
      else if (e.key === 'ArrowDown') next = idx + cols;
      else if (e.key === 'ArrowUp') next = idx - cols;
      else return;

      if (next < 0 || next >= buttons.length) return;
      // Keep horizontal movement within the same row.
      if (
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight') &&
        Math.floor(next / cols) !== Math.floor(idx / cols)
      ) {
        return;
      }

      e.preventDefault();
      buttons[next].focus();
    },
    [cols]
  );

  return { onKeyDown };
}
