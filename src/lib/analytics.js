export function trackEvent(eventName, parameters = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, parameters);
}
