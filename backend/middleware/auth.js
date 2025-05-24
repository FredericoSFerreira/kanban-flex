import {jwtVerify} from "jose";
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({msg: 'Token not pass'});
  }

  try {
    const {payload} = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });
    console.log(payload)
    req.user = payload;
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({msg: 'Invalid Token'});
  }
}
