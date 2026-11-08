import { useEffect, useRef } from 'react';

/**
 * Syncs a Dialog open state with browser history so the hardware/browser
 * back button closes the dialog instead of navigating away from the page.
 * When the dialog opens we push a sentinel history entry; pressing back
 * pops it and closes the dialog. Closing via the UI pops the sentinel too.
 */
export function useBackButtonClose(open, onClose) {
  const pushed = useRef(false);
  const cbRef = useRef(onClose);
  cbRef.current = onClose;

  useEffect(() => {
    if (open && !pushed.current) {
      window.history.pushState({ modal: true }, '');
      pushed.current = true;
      const onPop = () => {
        pushed.current = false;
        cbRef.current?.();
      };
      window.addEventListener('popstate', onPop);
      return () => {
        window.removeEventListener('popstate', onPop);
        if (pushed.current) {
          pushed.current = false;
          window.history.back();
        }
      };
    }
  }, [open]);
}