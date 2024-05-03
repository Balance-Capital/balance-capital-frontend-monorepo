export function getCustomHeaders() {
  const headers = {} as any;
  if (process.env["NX_SKIP_CHALLENEGE_HEADER"]) {
    headers["x-skip-challenge"] = process.env["NX_SKIP_CHALLENEGE_HEADER"];
  }
  if (
    window !== window.parent &&
    window.location.pathname.includes("/trade-widget") &&
    process.env["NX_IFRAME_SKIP_CHALLENEGE_HEADER"]
  ) {
    headers["x-referer"] = process.env["NX_IFRAME_SKIP_CHALLENEGE_HEADER"];
  }
  return headers;
}

// Make requests to CryptoCompare API
export async function makeApiRequest(path: string) {
  const headers = getCustomHeaders();
  try {
    const response = await fetch(path, {
      method: "GET",
      headers: headers,
      credentials: "include",
    });
    return response.json();
  } catch (error: any) {
    console.log("Backend issue: ", error.status);
  }
}

export function parseFullSymbol(fullSymbol: string) {
  const match = fullSymbol.match(/(\w+)\/(\w+)$/);
  if (!match) {
    return null;
  }

  return {
    fromSymbol: match[1],
    toSymbol: match[2],
  };
}
