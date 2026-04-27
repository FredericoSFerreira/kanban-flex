import {SignJWT} from 'jose'

const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function generateToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime('168h')
    .sign(JWT_SECRET_KEY);
}


function generateBoardSummaryPrompt(board, options = {}) {
  // Backwards compatibility: if second arg is a boolean (old signature), convert
  if (typeof options === 'boolean') {
    const includeLabel = options;
    const includeMembers = arguments[2] === true;
    options = { includeLabel, includeMembers };
  }

  const {
    includeLabel = false,
    includeMembers = false,
    includeArchived = false,
    includeChecklist = false,
    includeComments = false,
    includeVotes = false,
    includeHistory = false,
    includeBoardMeta = false,
    maxComments = 3,
    maxHistory = 1,
    maxDescriptionLength = 300,
    maxCommentLength = 200,
  } = options;

  const truncate = (str, max) => {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '...' : str;
  };

  const formatCard = (card, index) => {
    let text = `  Card ${index + 1}: ${card.title || 'Sem título'}\n`;
    text += `    Descrição: ${truncate(card.description, maxDescriptionLength) || 'Sem descrição'}\n`;

    if (includeLabel && card.labels?.length) {
      text += `    Tags: ${card.labels.join(', ')}\n`;
    }

    if (includeMembers) {
      text += `    Autor: ${card.name || 'Desconhecido'}\n`;
    }

    if (card.assigned_users?.length) {
      const names = card.assigned_users.map(u => u.name).join(', ');
      text += `    Atribuído para: ${names}\n`;
    }

    if (includeVotes && (card.up_vote !== undefined || card.down_vote !== undefined)) {
      text += `    Votos: 👍 ${card.up_vote || 0} | 👎 ${card.down_vote || 0}\n`;
    }

    if (includeChecklist && card.checklist?.length) {
      const done = card.checklist.filter(i => i.completed).length;
      text += `    Checklist: ${done}/${card.checklist.length} itens concluídos\n`;
    }

    if (includeComments && card.comments?.length) {
      const recent = card.comments.slice(-maxComments);
      text += `    Comentários (${card.comments.length} total, exibindo últimos ${recent.length}):\n`;
      recent.forEach(c => {
        text += `      - ${c.userName || 'Anônimo'}: "${truncate(c.text, maxCommentLength)}"\n`;
      });
    }

    if (includeHistory && card.history?.length) {
      const last = card.history.slice(-maxHistory);
      last.forEach(h => {
        const who = h.user?.name || 'Alguém';
        const when = h.timestamp ? new Date(h.timestamp).toLocaleDateString('pt-BR') : '';
        if (h.action === 'create_card') text += `    Histórico: ${who} criou o card${when ? ' em ' + when : ''}\n`;
        else if (h.action === 'archive_card') text += `    Histórico: ${who} arquivou o card${when ? ' em ' + when : ''}\n`;
        else if (h.action === 'assign_member') text += `    Histórico: ${who} atribuiu para ${h.data?.assigneeName || '?'}${when ? ' em ' + when : ''}\n`;
        else if (h.action === 'unassign_member') text += `    Histórico: ${who} removeu atribuição de ${h.data?.unassigneeName || '?'}${when ? ' em ' + when : ''}\n`;
        else text += `    Histórico: ${who} moveu de "${h.data?.source?.columnName || '?'}" para "${h.data?.target?.columnName || '?'}"${when ? ' em ' + when : ''}\n`;
      });
    }

    return text;
  };

  // — Board meta header —
  let text = '';
  if (includeBoardMeta) {
    const totalActive = board.columns.reduce((acc, col) => acc + (col.itens?.filter(c => !c.archived)?.length || 0), 0);
    const totalArchived = board.columns.reduce((acc, col) => acc + (col.itens?.filter(c => c.archived)?.length || 0), 0);
    const visibility = board.is_public === false ? 'Privado' : 'Público';
    text += `Board: ${board.name}\n`;
    text += `Visibilidade: ${visibility} | Criado por: ${board.owner || 'Desconhecido'}\n`;
    text += `Total de colunas: ${board.columns?.length || 0} | Cards ativos: ${totalActive} | Cards arquivados: ${totalArchived}\n\n`;
  } else {
    text += `Board: ${board.name}\n\n`;
  }

  // — Active cards per column —
  text += `=== Colunas e Cards Ativos ===\n\n`;
  board.columns.forEach((coluna) => {
    const activeCards = (coluna.itens || []).filter(c => !c.archived);
    text += `Coluna: ${coluna.name} (${activeCards.length} card(s) ativo(s))\n`;
    activeCards.forEach((card, j) => {
      text += formatCard(card, j);
    });
    text += `\n`;
  });

  // — Archived cards section —
  if (includeArchived) {
    const archivedCards = [];
    board.columns.forEach(col => {
      (col.itens || []).filter(c => c.archived).forEach(card => {
        archivedCards.push({ ...card, _columnName: col.name });
      });
    });

    if (archivedCards.length > 0) {
      text += `=== Cards Arquivados (${archivedCards.length}) ===\n`;
      archivedCards.forEach((card, j) => {
        text += `  - ${card.title || 'Sem título'} (coluna original: ${card._columnName})\n`;
        if (card.description) text += `    Descrição: ${truncate(card.description, maxDescriptionLength)}\n`;
      });
      text += `\n`;
    }
  }

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

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export {generateOtp, generateToken, generateBoardSummaryPrompt, parseBoolean, getFirstAndLastName, getDefaultUrlAvatar, generateTrackingHistory, escapeRegex}
