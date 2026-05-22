export function register() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => {
          console.log('HabitAI Service Worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.error('HabitAI Service Worker registration failed:', err);
        });
    });
  } else if ('serviceWorker' in navigator) {
    // Also allow in dev for testing if needed
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => {
          console.log('HabitAI Service Worker registered in Dev Mode:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration skipped or failed in Dev:', err);
        });
    });
  }
}
