export const firstStringifyThenEncodedURI = (data: unknown) => {
  return encodeURIComponent(JSON.stringify(data));
};
export const functionDebounce = (fn: any, delay: number) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: any) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(fn, delay, ...args);
  };
};
