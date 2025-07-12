import {useAuthStore} from "@/stores/auth";

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


const getUserLoggedAvatar = () => {
  const auth = useAuthStore();
  return auth.user?.avatar ? auth.user?.avatar : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${getFirstAndLastName(user)}`;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString();
};

export {removePathFromUrl, sleep, getFirstAndLastName, formatDate, formatTime, getUserLoggedAvatar}

