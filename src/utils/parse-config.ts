import Parse from 'parse/dist/parse.min.js';

export const initializeParse = () => {
  const config = {
    appId: import.meta.env.VITE_PARSE_APP_ID || '' as string,
    serverURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/parse' as string,
  }
  Parse.initialize(config.appId);
  Parse.serverURL = config.serverURL;
  Parse.enableLocalDatastore()
  console.log('Parse.js initialized')
}
