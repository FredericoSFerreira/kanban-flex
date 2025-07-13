import {SignJWT} from 'jose'

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


function generateBoardSummaryPrompt(board, includeLabel = false, includeMembers = false) {
  let text = `Board: ${board.name}\n\n`;

  board.columns.forEach((coluna, i) => {
    text += `Coluna: ${coluna.name}\n`;

    coluna.itens.forEach((card, j) => {
      text += `- Card ${j + 1}\n`;
      text += `  - Título: ${card.title || 'Sem título'}\n`;
      text += `  - Descrição: ${card.description || 'Sem descrição'}\n`;
      text += includeLabel ? `  - Tags: ${card.labels.length ? card.labels.join(', ') : 'nenhuma'}\n` : '';
      text += includeMembers ? `  - Usuario/Membro do Card: ${card.name}\n` : '';
    });

    text += `\n`;
  });

  return text;
}


function parseBoolean(value) {
  return value === 'true' ? true : value === 'false' ? false : undefined;
}

function getFirstAndLastName (user) {
  const parts = user?.name?.trim().split(/\s+/) || '';
  if (parts.length === 1) {
    return parts[0];
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first} ${last}`;
}


function getDefaultUrlAvatar(user) {
  return `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${getFirstAndLastName(user)}`;
}

function generateTrackingHistory(request, action, data) {
  return {
      user: {
        name: request.user?.name || 'Sistema',
        avatar: request.user?.avatar || getDefaultUrlAvatar(request.user)
      },
      action,
      timestamp: new Date(),
      data
    }

}

export {generateOtp, generateToken, generateBoardSummaryPrompt, parseBoolean, getFirstAndLastName, generateTrackingHistory}
