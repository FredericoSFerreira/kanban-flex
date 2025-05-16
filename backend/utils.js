import {jwtVerify, SignJWT} from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function generateToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}


async function verifyToken(req, res, next) {
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
    return res.status(403).json({mensagem: 'Invalid Token'});
  }
}

function requestInfo(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  req.clientInfo = {
    ip,
    userAgent,
  };
  next();
}


function generateBoardSummaryPrompt(board) {
  let text = `Board: ${board.name}\n\n`;

  board.columns.forEach((coluna, i) => {
    text += `Coluna: ${coluna.name}\n`;

    coluna.itens.forEach((card, j) => {
      text += `- Card ${j + 1}\n`;
      text += `  - Título: ${card.title || 'Sem título'}\n`;
      text += `  - Descrição: ${card.description || 'Sem descrição'}\n`;
      // text += `  - Tags: ${card.labels.length ? card.labels.join(', ') : 'nenhuma'}\n`;
    });

    text += `\n`;
  });

  return text;
}


function parseBoolean(value) {
  return value === 'true' ? true : value === 'false' ? false : undefined;
}

export {generateOtp, generateToken, verifyToken, requestInfo, generateBoardSummaryPrompt, parseBoolean}
