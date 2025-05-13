function removePathFromUrl(url: string): string {
    const lastSlashIndex = url.lastIndexOf('/');
    return lastSlashIndex !== -1 ? url.substring(0, lastSlashIndex) : url;
}

function sleep(ms: number = 2000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}


const getFirstAndLastName = (user): string => {
  const parts = user?.name?.trim().split(/\s+/) || '';
  if (parts.length === 1) {
    return parts[0];
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first} ${last}`;
}

export { removePathFromUrl, sleep, getFirstAndLastName }

