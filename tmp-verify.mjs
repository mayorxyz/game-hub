globalThis.localStorage = {
  getItem: () => '{bad json',
  setItem() {},
  removeItem() {},
  clear() {},
};

const { getSettings } = await import('./src/lib/persistence.ts');
console.log(JSON.stringify(getSettings()));
