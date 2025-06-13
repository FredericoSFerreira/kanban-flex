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
    req.token = { context: {'Authorization': `Bearer ${token}`} };
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({msg: 'Invalid Token'});
  }
}

const publicFunctions = ['saveOtp', 'getOtp', 'checkOtp'];

export async function verifyTokenParseCloudFunction(request) {
  // Skip validation for public functions
  if (publicFunctions.includes(request.functionName)) {
    return true;
  }
  const token = request?.context?.Authorization.replace('Bearer ', '') || null;

  if (!token) {
    throw new Parse.Error(401, 'JWT token is required');
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });

    request.user = payload;
    return true;
  } catch (error) {
    console.error('JWT validation error:', error);
    throw new Parse.Error(401, 'Invalid JWT token');
  }
}

