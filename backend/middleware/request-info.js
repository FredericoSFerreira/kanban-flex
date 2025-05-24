export function requestInfo(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  req.clientInfo = {
    ip,
    userAgent,
  };
  next();
}
