import {UAParser} from 'ua-parser-js';


// Board operations Cloud Functions
Parse.Cloud.define("updateCardPosition", async (request) => {

  try {
    const { boardId, columnId, items } = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    const columns = board.get('columns');
    const [column, columnIndex] = findColumn(columns, columnId);

    if (!column) {
      throw new Error("Column not found");
    }

    // Update the items array for this specific column
    board.set(`columns.${columnIndex}.itens`, items);

    const result = await board.save(null, { useMasterKey: true });
    return { success: true, result };
  } catch (error) {
    console.error("Error in updateCardPosition:", error);
    throw error;
  }
});

Parse.Cloud.define("moveCardBetweenColumns", async (request) => {
  try {
    const { boardId, sourceColumnId, targetColumnId, cardId } = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    const columns = board.get('columns');
    const [sourceColumn, sourceColumnIndex] = findColumn(columns, sourceColumnId);
    const [targetColumn, targetColumnIndex] = findColumn(columns, targetColumnId);

    if (!sourceColumn || !targetColumn) {
      throw new Error("Column not found");
    }

    const [card, cardIndex] = findCard(sourceColumn, cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    // Remove card from source column
    sourceColumn.itens.splice(cardIndex, 1);

    // Add card to target column
    targetColumn.itens.push(card);

    // Update both columns
    board.set(`columns.${sourceColumnIndex}.itens`, sourceColumn.itens);
    board.set(`columns.${targetColumnIndex}.itens`, targetColumn.itens);

    const result = await board.save(null, { useMasterKey: true });
    return { success: true, result };
  } catch (error) {
    console.error("Error in moveCardBetweenColumns:", error);
    throw error;
  }
});

Parse.Cloud.define("updateColumnPosition", async (request) => {
  try {
    const { boardId, columns } = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    // Update the columns array
    board.set('columns', columns);

    const result = await board.save(null, { useMasterKey: true });
    return { success: true, result };
  } catch (error) {
    console.error("Error in updateColumnPosition:", error);
    throw error;
  }
});

Parse.Cloud.define("addCard", async (request) => {
  try {
    const { boardId, columnId, card } = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    const columns = board.get('columns');
    const [column, columnIndex] = findColumn(columns, columnId);

    if (!column) {
      throw new Error("Column not found");
    }

    // Add card to column
    board.add(`columns.${columnIndex}.itens`, card);

    const result = await board.save(null, { useMasterKey: true });
    return { success: true, result };
  } catch (error) {
    console.error("Error in addCard:", error);
    throw error;
  }
});

Parse.Cloud.define("updateCard", async (request) => {
  try {
    const { boardId, columnId, cardId, updates } = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    const columns = board.get('columns');
    const [column, columnIndex] = findColumn(columns, columnId);

    if (!column) {
      throw new Error("Column not found");
    }

    const [card, cardIndex] = findCard(column, cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    // Update card properties
    Object.keys(updates).forEach(key => {
      board.set(`columns.${columnIndex}.itens.${cardIndex}.${key}`, updates[key]);
    });

    const result = await board.save(null, { useMasterKey: true });
    return { success: true, result };
  } catch (error) {
    console.error("Error in updateCard:", error);
    throw error;
  }
});

Parse.Cloud.define("removeCard", async (request) => {
  try {
    const { boardId, columnId, cardId } = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    const columns = board.get('columns');
    const [column, columnIndex] = findColumn(columns, columnId);

    if (!column) {
      throw new Error("Column not found");
    }

    const [card, cardIndex] = findCard(column, cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    // Remove card from column
    board.remove(`columns.${columnIndex}.itens`, card);

    const result = await board.save(null, { useMasterKey: true });
    return { success: true, result };
  } catch (error) {
    console.error("Error in removeCard:", error);
    throw error;
  }
});

Parse.Cloud.define("addColumn", async (request) => {
  try {
    const { boardId, column } = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    // Add column to board
    board.add("columns", column);

    const result = await board.save(null, { useMasterKey: true });
    return { success: true, result };
  } catch (error) {
    console.error("Error in addColumn:", error);
    throw error;
  }
});

Parse.Cloud.define("updateColumn", async (request) => {
  try {
    const { boardId, columnId, updates } = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    const columns = board.get('columns');
    const [column, columnIndex] = findColumn(columns, columnId);

    if (!column) {
      throw new Error("Column not found");
    }

    // Update column properties
    Object.keys(updates).forEach(key => {
      board.set(`columns.${columnIndex}.${key}`, updates[key]);
    });

    const result = await board.save(null, { useMasterKey: true });
    return { success: true, result };
  } catch (error) {
    console.error("Error in updateColumn:", error);
    throw error;
  }
});

Parse.Cloud.define("removeColumn", async (request) => {
  try {
    const { boardId, columnId } = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    const columns = board.get('columns');
    const [column, columnIndex] = findColumn(columns, columnId);

    if (!column) {
      throw new Error("Column not found");
    }

    // Remove column from board
    board.remove("columns", column);

    const result = await board.save(null, { useMasterKey: true });
    return { success: true, result };
  } catch (error) {
    console.error("Error in removeColumn:", error);
    throw error;
  }
});

Parse.Cloud.define("updateBoardProperties", async (request) => {
  try {
    const { boardId, updates } = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    // Update board properties
    Object.keys(updates).forEach(key => {
      board.set(key, updates[key]);
    });

    const result = await board.save(null, { useMasterKey: true });
    return { success: true, result };
  } catch (error) {
    console.error("Error in updateBoardProperties:", error);
    throw error;
  }
});

Parse.Cloud.define("updateCardVotes", async (request) => {
  try {
    const { boardId, columnId, cardId, userId, voteType } = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    const columns = board.get('columns');
    const [column, columnIndex] = findColumn(columns, columnId);

    if (!column) {
      throw new Error("Column not found");
    }

    const [card, cardIndex] = findCard(column, cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    // Check if user already voted
    const upVoteUsers = card.up_vote_users || [];
    const downVoteUsers = card.down_vote_users || [];

    // Toggle vote behavior
    if (voteType === 'up') {
      if (upVoteUsers.includes(userId)) {
        // User already upvoted, so remove the vote
        board.remove(`columns.${columnIndex}.itens.${cardIndex}.up_vote_users`, userId);
        board.increment(`columns.${columnIndex}.itens.${cardIndex}.up_vote`, -1);
      } else {
        // Add new upvote
        board.addUnique(`columns.${columnIndex}.itens.${cardIndex}.up_vote_users`, userId);
        board.increment(`columns.${columnIndex}.itens.${cardIndex}.up_vote`);
      }
    } else if (voteType === 'down') {
      if (downVoteUsers.includes(userId)) {
        // User already downvoted, so remove the vote
        board.remove(`columns.${columnIndex}.itens.${cardIndex}.down_vote_users`, userId);
        board.increment(`columns.${columnIndex}.itens.${cardIndex}.down_vote`, -1);
      } else {
        // Add new downvote
        board.addUnique(`columns.${columnIndex}.itens.${cardIndex}.down_vote_users`, userId);
        board.increment(`columns.${columnIndex}.itens.${cardIndex}.down_vote`);
      }
    }

    const result = await board.save(null, { useMasterKey: true });
    return { success: true, result };
  } catch (error) {
    console.error("Error in updateCardVotes:", error);
    throw error;
  }
});

// Helper functions for board operations
function findColumn(columns, columnId) {
  for (const columnIndex in columns) {
    if (columns[columnIndex].id === columnId) {
      return [columns[columnIndex], columnIndex];
    }
  }
  return [null, -1];
}

function findCard(column, cardId) {
  for (const cardIndex in column.itens) {
    const cardItem = column.itens[cardIndex];
    if (cardItem?.id === cardId) {
      return [cardItem, cardIndex];
    }
  }
  return [null, -1];
}

async function saveLog(request, user, action = 'login') {
  const accessLog = Parse.Object.extend("accessLog");
  const log = new accessLog();
  const {browser, cpu, device, os} = UAParser(request.params.userAgent);
  log.save({
    id_user: user.id,
    ip: request.params.ip,
    browser: browser.name,
    device: {
      vendor: device.vendor,
      model: device.model,
      os: os.name,
      cpu: cpu.architecture
    },
    action: action,
  })
}

Parse.Cloud.define("getOtp", async (request) => {
  try {
    const query = new Parse.Query("otp");
    query.equalTo({'email': request.params.email})
    const otp = await query.first();
    if (!otp) {
      return {notFound: true}
    }
    console.log(otp.attributes)
    return otp.attributes;
  } catch (error) {
    console.log('Failed to getOtp, with error code: ' + error.message);
    throw error
  }
});


Parse.Cloud.define("saveOtp", async (request) => {
  try {
    const OTP = Parse.Object.extend("otp");
    const otp = new OTP();
    const otpQuery = new Parse.Query(OTP);
    otpQuery.equalTo({'email': request.params.email})
    const otpData = await otpQuery.first();
    if (otpData) {
      if (request.params.phone) otpData.set("phone", request.params.phone);
      if (request.params.picture) otpData.set("avatar", request.params.picture);
      await otpData.save();
      await saveLog(request, otpData, 'login')
      return {conflict: true, id: otpData.id, ...otpData.attributes}
    }
    const saveResult = await otp.save({
      name: request.params.name,
      email: request.params.email,
      phone: request.params.phone || null,
      isValid: request.params.isValid || false,
      active: true,
      code: request.params.code || null,
      avatar: request.params.picture || null,
    })
    await saveLog(request, saveResult, 'register')

    return {conflict: false, ...saveResult}
  } catch (error) {
    console.log('Failed to getOtp, with error code: ' + error.message);
    throw error
  }
});


Parse.Cloud.define("updateOtp", async (request) => {
  const query = new Parse.Query("otp");

  query.equalTo("email", request.params.email)
  query.first().then((otp) => {
    otp.set('code', request.params.code)
    if (request.params.isValid) {
      otp.set('isValid', true)
    }
    return otp.save();
  });
});


Parse.Cloud.define("checkOtp", async (request) => {
  try {
    const query = new Parse.Query("otp");
    query.equalTo({'email': request.params.email, 'code': request.params.code})
    const otp = await query.first();
    if (otp) await saveLog(request, {id: otp.id})
    return {id: otp.id, ...otp.attributes};
  } catch (error) {
    console.log('Failed to checkOtp, with error code: ' + error.message);
  }
});


Parse.Cloud.define("getMyBoards", async (request) => {
  try {
    const query = new Parse.Query("boards");
    console.log(request.params.email)
    query.equalTo({'owner_email': request.params.email})
    query.descending('_created_at')
    return await query.find();
  } catch (error) {
    console.log('Failed to getOtp, with error code: ' + error.message);
    throw error
  }
});


Parse.Cloud.define("getMyAccessLogs", async (request) => {
  try {
    const query = new Parse.Query("accessLog");
    query.equalTo({'id_user': request.params.id})
    query.descending('_created_at')
    // query.limit(10)
    return await query.find();
  } catch (error) {
    console.log('Failed to getLogs, with error code: ' + error.message);
    throw error
  }
});


Parse.Cloud.define("updateUserOtp", async (request) => {
  const query = new Parse.Query("otp");
  console.log(request.params, "jgjhg")
  query.equalTo("objectId", request.params.id)
  query.first().then((otp) => {
    otp.set('name', request.params.name)
    otp.set('phone', request.params.phone)
    otp.set('active', request.params.active === undefined ? true : request.params.active)
    return otp.save();
  });
});
