function removePathFromUrl(url: string): string {
    const lastSlashIndex = url.lastIndexOf('/');
    return lastSlashIndex !== -1 ? url.substring(0, lastSlashIndex) : url;
}

function sleep(ms: number = 2000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export { removePathFromUrl, sleep }

