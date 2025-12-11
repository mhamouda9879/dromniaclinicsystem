// Emergency fix - add this to index.tsx temporarily
console.log('Applying emergency fix...');

// Remove any blocking elements
setTimeout(() => {
  document.querySelectorAll('*').forEach(el => {
    const computed = window.getComputedStyle(el);
    // If element has high z-index and covers screen, check it
    if (computed.position === 'fixed' && 
        parseInt(computed.zIndex) > 100 && 
        el.offsetWidth === window.innerWidth &&
        el.offsetHeight === window.innerHeight) {
      console.warn('Found potential blocking element:', el);
      el.style.display = 'none';
    }
  });
  
  // Force enable all interactions
  document.body.style.pointerEvents = 'auto';
  document.body.style.userSelect = 'auto';
  const root = document.getElementById('root');
  if (root) {
    root.style.pointerEvents = 'auto';
    root.style.zIndex = '1';
  }
  
  console.log('Fix applied!');
}, 1000);
