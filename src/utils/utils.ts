function removePathFromUrl(url: string): string {
    const lastSlashIndex = url.lastIndexOf('/');
    return lastSlashIndex !== -1 ? url.substring(0, lastSlashIndex) : url;
}

export { removePathFromUrl }


