import {UAParser} from 'ua-parser-js';
import {verifyTokenParseCloudFunction} from "../middleware/auth.js";
import {escapeRegex, generateTrackingHistory} from "../utils/utils.js";
import {callFunction} from "../utils/parse-utils.js";
import {deleteFileFromS3} from "../service/s3-service.js";
import sendEmail from "../service/email-service.js";


async function deleteAttachmentHelper(boardId, itemId, request) {

  const query = new Parse.Query("attachments");
  query.equalTo("boardId", boardId);
  query.equalTo("itemId", itemId);

  try {
    const results = await query.find({useMasterKey: true});

    await Promise.all(
      results.map(async (obj) => {
        await deleteFileFromS3(obj.get("url"));
        await callFunction("deleteAttachment", {attachmentId: obj.id}, request);
      })
    );
  } catch (err) {
    console.log("Erro ao buscar attachments: " + err.message);
  }
}

// Apply JWT validation to all cloud functions
Parse.Cloud.beforeSave('*', async (request) => {
  if (!request.master && !request.isFromCloudCode) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Direct database access is not allowed');
  }
});

Parse.Cloud.beforeDelete('*', async (request) => {
  if (!request.master && !request.isFromCloudCode) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Direct database access is not allowed');
  }
});

// Global beforeFind trigger to prevent REST API access
Parse.Cloud.beforeFind('*', async (request) => {
  if (!request.master && !request.isFromCloudCode) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Direct database access is not allowed');
  }
});


// Board operations Cloud Functions
Parse.Cloud.define("updateCardPosition", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, columnId, items} = request.params;
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

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in updateCardPosition:", error);
    throw error;
  }
});

Parse.Cloud.define("moveCardBetweenColumns", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, sourceColumnId, targetColumnId, cardId} = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    const columns = board.get('columns');
    const [sourceColumn, sourceColumnIndex] = findColumn(columns, sourceColumnId);
    const [targetColumn, targetColumnIndex] = findColumn(columns, targetColumnId);

    console.log(sourceColumn, targetColumn, request.user, "#############")

    if (!sourceColumn || !targetColumn) {
      throw new Error("Column not found");
    }

    const [card, cardIndex] = findCard(sourceColumn, cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    // Inicializa o histórico se não existir
    if (!card.history) {
      card.history = [];
    }

    // Adiciona o evento de movimentação ao histórico
    card.history.push(
      generateTrackingHistory(request, 'move_card', {
        source: {
          columnId: sourceColumnId,
          columnName: sourceColumn.name
        },
        target: {
          columnId: targetColumnId,
          columnName: targetColumn.name
        }
      }))

    // Remove card from source column
    sourceColumn.itens.splice(cardIndex, 1);

    // Add card to target column
    targetColumn.itens.push(card);

    // Update both columns
    board.set(`columns.${sourceColumnIndex}.itens`, sourceColumn.itens);
    board.set(`columns.${targetColumnIndex}.itens`, targetColumn.itens);

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in moveCardBetweenColumns:", error);
    throw error;
  }
});

Parse.Cloud.define("updateColumnPosition", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, columns} = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    // Update the columns array
    board.set('columns', columns);

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in updateColumnPosition:", error);
    throw error;
  }
});

Parse.Cloud.define("addCard", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, columnId, card} = request.params;
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

    card.createdAt = new Date();

    // Inicializa o histórico para novos cards
    if (!card.history) {
      card.history = [];
    }

    card.history.push(generateTrackingHistory(request, 'create_card', {}));

    // Add card to column
    board.add(`columns.${columnIndex}.itens`, card);

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in addCard:", error);
    throw error;
  }
});

Parse.Cloud.define("updateCard", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, columnId, cardId, updates} = request.params;
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

    if (!card.history) {
      board.set(`columns.${columnIndex}.itens.${cardIndex}.history`, []);
    }

    // if (Object.keys(updates).some(key => !['updatedAt'].includes(key))) {
    //   const historyEntry = {
    //     user: {
    //       name: request.user?.name || 'Sistema',
    //       avatar: request.user?.avatar || null
    //     },
    //     action: 'update_card',
    //     timestamp: new Date(),
    //     data: {
    //       updates: Object.keys(updates)
    //         .filter(key => !['updatedAt', 'history', 'comments'].includes(key))
    //         .reduce((obj, key) => {
    //           obj[key] = updates[key];
    //           return obj;
    //         }, {})
    //     }
    //   };
    //   board.add(`columns.${columnIndex}.itens.${cardIndex}.history`, historyEntry);
    // }

    updates.updatedAt = new Date();
    // Update card properties
    Object.keys(updates).forEach(key => {
      board.set(`columns.${columnIndex}.itens.${cardIndex}.${key}`, updates[key]);
    });

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in updateCard:", error);
    throw error;
  }
});

Parse.Cloud.define("removeCard", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, columnId, cardId} = request.params;
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
    columns[columnIndex].itens.splice(cardIndex, 1);
    board.set(`columns.${columnIndex}.itens`, columns[columnIndex].itens);


    await deleteAttachmentHelper(boardId, cardId, request)

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in removeCard:", error);
    throw error;
  }
});

Parse.Cloud.define("addColumn", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, column} = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    // Add column to board
    board.add("columns", column);

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in addColumn:", error);
    throw error;
  }
});

Parse.Cloud.define("updateColumn", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, columnId, updates} = request.params;
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

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in updateColumn:", error);
    throw error;
  }
});

Parse.Cloud.define("removeColumn", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, columnId} = request.params;
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

    // Remove column from board usando splice para remover pelo índice
    columns.splice(columnIndex, 1);
    // Atualizar o array de colunas completo
    board.set('columns', columns);

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in removeColumn:", error);
    throw error;
  }
});

Parse.Cloud.define("updateBoardProperties", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, updates} = request.params;
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

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in updateBoardProperties:", error);
    throw error;
  }
});

Parse.Cloud.define("updateCardVotes", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, columnId, cardId, userId, voteType} = request.params;
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

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in updateCardVotes:", error);
    throw error;
  }
});

Parse.Cloud.define("archiveCard", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, columnId, cardId, archived} = request.params;
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

    // Inicializa o histórico se não existir
    if (!card.history) {
      board.set(`columns.${columnIndex}.itens.${cardIndex}.history`, []);
    }

    // Registra a ação no histórico
    board.add(`columns.${columnIndex}.itens.${cardIndex}.history`,
      generateTrackingHistory(request, archived ? 'archive_card' : 'unarchive_card', {}));

    board.set(`columns.${columnIndex}.itens.${cardIndex}.archived`, archived);
    board.set(`columns.${columnIndex}.itens.${cardIndex}.updatedAt`, new Date());

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in archiveCard:", error);
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
  }, {useMasterKey: true})
}

Parse.Cloud.define("getOtp", async (request) => {
  try {
    const query = new Parse.Query("otp");
    query.equalTo({'email': request.params.email})
    const otp = await query.first({useMasterKey: true});
    if (!otp) {
      return {notFound: true}
    }
    return {
      success: true,
      email: otp.get('email'),
      name: otp.get('name'),
      isValid: otp.get('isValid'),
      active: otp.get('active'),
    };

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
    const otpData = await otpQuery.first({useMasterKey: true});
    if (otpData) {
      if (request.params.phone) otpData.set("phone", request.params.phone);
      if (request.params.picture) otpData.set("avatar", request.params.picture);
      await otpData.save(null, {useMasterKey: true});
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
    }, {useMasterKey: true})
    await saveLog(request, saveResult, 'register')

    return {conflict: false, ...saveResult}
  } catch (error) {
    console.log('Failed to getOtp, with error code: ' + error.message);
    throw error
  }
});

Parse.Cloud.define("checkOtp", async (request) => {
  try {
    const query = new Parse.Query("otp");
    query.equalTo({'email': request.params.email, 'code': request.params.code})
    // Add check for active=true
    query.equalTo('active', true);

    const otp = await query.first({useMasterKey: true});
    if (!otp) {
      return null; // Return null if no matching OTP found or user is inactive
    }

    await saveLog(request, {id: otp.id})
    return {id: otp.id, ...otp.attributes};
  } catch (error) {
    console.log('Failed to checkOtp, with error code: ' + error.message);
    return null;
  }
});


Parse.Cloud.define("getMyBoards", async (request) => {
  try {
    await verifyTokenParseCloudFunction(request);
    const query = new Parse.Query("boards");

    // Build match condition
    const matchCondition = {owner_email: request.params.email};

    // Add search filter if provided
    if (request.params.search) {
      matchCondition.name = {$regex: escapeRegex(request.params.search), $options: 'i'};
    }

    const pipeline = [
      {$match: matchCondition},
      {
        $addFields: {
          totalColumns: {$size: "$columns"},
          totalItems: {
            $sum: {
              $map: {
                input: "$columns",
                as: "col",
                in: {$size: "$$col.itens"}
              }
            }
          }
        }
      },
      {$unwind: {path: "$columns", preserveNullAndEmptyArrays: true}},
      {$unwind: {path: "$columns.itens", preserveNullAndEmptyArrays: true}},
      {
        $group: {
          _id: "$_id",
          name: {$first: "$name"},
          totalColumns: {$first: "$totalColumns"},
          totalItems: {$first: "$totalItems"},
          unique_users: {
            $addToSet: "$columns.itens.user_id"
          },
          created_at: {
            $first: "$_created_at"
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          totalColumns: 1,
          totalItems: 1,
          totalUsers: {$size: "$unique_users"},
          created_at: 1
        }
      },
      {$sort: {created_at: -1}},
    ];

    return await query.aggregate(pipeline);
  } catch (error) {
    console.log('Failed to getMyBoards, with error code: ' + error.message);
    throw error
  }
});


Parse.Cloud.define("getMyAccessLogs", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const query = new Parse.Query("accessLog");
    query.equalTo({'id_user': request.params.id})
    query.descending('_created_at')
    // query.limit(10)
    return await query.find({useMasterKey: true});
  } catch (error) {
    console.log('Failed to getLogs, with error code: ' + error.message);
    throw error
  }
});


Parse.Cloud.define("updateUserOtp", async (request) => {
  // Validate JWT token
  await verifyTokenParseCloudFunction(request);

  const query = new Parse.Query("otp");
  query.equalTo("objectId", request.params.id)
  query.first().then((otp) => {

    if (otp.id !== request.params.id) throw new Error("Invalid update User")
    otp.set('name', request.params.name)
    otp.set('phone', request.params.phone)
    otp.set('active', request.params.active === undefined ? true : request.params.active)
    return otp.save(null, {useMasterKey: true});
  });
});

Parse.Cloud.define("getUserMe", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const query = new Parse.Query("otp");
    query.equalTo("objectId", request.params.id);
    const user = await query.first({useMasterKey: true});

    if (!user) {
      throw new Error("User not found");
    }

    if (user.id !== request.params.id) {
      throw new Error("Invalid access to user data");
    }

    // Return the required fields: name, email, phone, avatar, and profile data
    return {
      id: user.id,
      name: user.get('name'),
      email: user.get('email'),
      phone: user.get('phone'),
      avatar: user.get('avatar'),
      active: user.get('active'),
      usedStorage: user.get('usedStorage'),
      limitStorage: user.get('limitStorage'),
    };
  } catch (error) {
    console.log('Failed to get user data, with error code: ' + error.message);
    throw error;
  }
});


Parse.Cloud.define("inviteMemberToBoard", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const { boardId, email } = request.params;
    if (!boardId || !email) throw new Error("Missing parameters");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error("invalid_email_format");

    // Check if board exists and user is owner
    const boardQuery = new Parse.Query("boards");
    boardQuery.equalTo('objectId', boardId);
    const board = await boardQuery.first({useMasterKey: true});

    if (!board) throw new Error("Board not found");
    if (board.get('owner_id') !== request.user.id) {
      throw new Error("Only the owner can invite members");
    }

    // Find user by email
    const otpQuery = new Parse.Query("otp");
    otpQuery.equalTo('email', email);
    const user = await otpQuery.first({useMasterKey: true});

    if (!user) {
      throw new Error("user_not_found");
    }

    // Check if user is already a member
    let members = board.get('members') || [];
    if (members.some(m => m.userId === user.id)) {
      throw new Error("user_already_member");
    }

    // Add to members
    members.push({
      userId: user.id,
      email: user.get('email'),
      name: user.get('name'),
      avatar: user.get('avatar'),
      role: 'member'
    });

    board.set('members', members);
    await board.save(null, {useMasterKey: true});

    return { success: true, member: members[members.length - 1] };
  } catch (error) {
    console.log('Failed to inviteMemberToBoard: ' + error.message);
    throw error;
  }
});

Parse.Cloud.define("removeMemberFromBoard", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const { boardId, userId } = request.params;
    if (!boardId || !userId) throw new Error("Missing parameters");

    // Check if board exists and user is owner
    const boardQuery = new Parse.Query("boards");
    boardQuery.equalTo('objectId', boardId);
    const board = await boardQuery.first({useMasterKey: true});

    if (!board) throw new Error("Board not found");
    if (board.get('owner_id') !== request.user.id) {
      throw new Error("Only the owner can remove members");
    }

    let members = board.get('members') || [];
    const index = members.findIndex(m => m.userId === userId);
    if (index === -1) {
      throw new Error("user_not_member");
    }

    members.splice(index, 1);
    board.set('members', members);

    // If removing a pending member, also invalidate the invite token
    if (userId.startsWith('pending:')) {
      const email = userId.split(':')[1];
      const inviteQuery = new Parse.Query("boardInvites");
      inviteQuery.equalTo("boardId", boardId);
      inviteQuery.equalTo("email", email);
      inviteQuery.equalTo("used", false);
      const invite = await inviteQuery.first({ useMasterKey: true });
      if (invite) {
        invite.set("used", true); // or delete it, but used=true is safer for history
        await invite.save(null, { useMasterKey: true });
      }
    }

    // Optional: Also remove the user from all assigned_users in cards
    const columns = board.get('columns') || [];
    columns.forEach(col => {
      if (col.itens) {
        col.itens.forEach(card => {
          if (card && card.assigned_users) {
            card.assigned_users = card.assigned_users.filter(u => u.id !== userId);
          }
        });
      }
    });
    board.set('columns', columns);

    await board.save(null, {useMasterKey: true});

    return { success: true };
  } catch (error) {
    console.log('Failed to removeMemberFromBoard: ' + error.message);
    throw error;
  }
});


Parse.Cloud.define("getBoardStats", async (request) => {
  // Validate JWT token
  await verifyTokenParseCloudFunction(request);

  const {id} = request.params;
  const db = new Parse.Query("boards");
  const pipeline = [
    {$match: {_id: id}},
    {
      $set: {
        boardName: "$name",
        totalColumns: {$size: "$columns"},
        totalItems: {
          $sum: {
            $map: {
              input: "$columns",
              as: "col",
              in: {$size: "$$col.itens"}
            }
          }
        }
      }
    },
    {$unwind: "$columns"},
    {$unwind: "$columns.itens"},
    {
      $facet: {
        board_info: [
          {
            $limit: 1
          },
          {
            $project: {
              boardName: 1,
              totalColumns: 1,
              totalItems: 1
            }
          }
        ],
        unique_users: [
          {
            $group: {
              _id: "$columns.itens.user_id",
              name: {$first: "$columns.itens.name"},
              avatar: {$first: "$columns.itens.avatar"}
            }
          },
          {
            $project: {
              _id: 0,
              user_id: "$_id",
              name: 1,
              avatar: 1
            }
          }
        ],
        top_liked_card: [
          {$sort: {"columns.itens.up_vote": -1}},
          {$limit: 1},
          {$replaceRoot: {newRoot: "$columns.itens"}}
        ],
        top_disliked_card: [
          {$sort: {"columns.itens.down_vote": -1}},
          {$limit: 1},
          {$replaceRoot: {newRoot: "$columns.itens"}}
        ],
        top_commented_card: [
          {
            $addFields: {
              comment_count: {$size: "$columns.itens.comments"}
            }
          },
          {$sort: {comment_count: -1}},
          {$limit: 1},
          {$replaceRoot: {newRoot: "$columns.itens"}}
        ],
        totals: [
          {
            $group: {
              _id: null,
              total_likes: {$sum: "$columns.itens.up_vote"},
              total_dislikes: {$sum: "$columns.itens.down_vote"},
              total_comments: {$sum: {$size: "$columns.itens.comments"}}
            }
          },
          {$project: {_id: 0}}
        ],
        label_counts: [
          {$unwind: "$columns.itens.labels"},
          {
            $group: {
              _id: "$columns.itens.labels",
              count: {$sum: 1}
            }
          },
          {
            $project: {
              _id: 0,
              label: "$_id",
              count: 1
            }
          },
          {$sort: {count: -1}}
        ]
      }
    }
  ];

  const results = await db.aggregate(pipeline)
  return results[0]

});


Parse.Cloud.define("getBoardById", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {id} = request.params;
    const query = new Parse.Query("boards");
    query.equalTo('objectId', id)
    const board = await query.first({useMasterKey: true});
    if (!board) {
      throw new Error("Board not found");
    }

    const userId = request.user?.id;
    if (userId) {
      const isPublic = board.get('is_public') !== false;

      if (!isPublic) {
        const isOwner = board.get('owner_id') === userId;
        const members = board.get('members') || [];
        const isMember = members.some(m => m.userId === userId);
        const columns = board.get('columns') || [];
        const hasCards = columns.some(c => (c.itens || []).some(card => card.user_id === userId));

        if (!isOwner && !isMember && !hasCards) {
          throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "Access denied: Board is private");
        }
      }
    }

    return board;
  } catch (error) {
    console.log('Failed to getBoardById, with error code: ' + error.message);
    throw error
  }
});

Parse.Cloud.define("getParticipatingBoards", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const query = new Parse.Query("boards");
    const userId = request.params.userId;

    const matchCondition = {
      "owner_id": {$ne: userId},
      $or: [
        {"columns.itens.user_id": userId},
        {"members.userId": userId}
      ]
    };

    // Add search filter if provided
    if (request.params.search) {
      matchCondition.name = {$regex: escapeRegex(request.params.search), $options: 'i'};
    }

    const pipeline = [
      {
        $match: matchCondition
      },
      {
        $addFields: {
          totalColumns: {$size: "$columns"},
          totalItems: {
            $sum: {
              $map: {
                input: "$columns",
                as: "col",
                in: {$size: "$$col.itens"}
              }
            }
          }
        }
      },
      {
        $unwind: {path: "$columns", preserveNullAndEmptyArrays: true}
      },
      {
        $unwind: {path: "$columns.itens", preserveNullAndEmptyArrays: true}
      },
      {
        $group: {
          _id: "$_id",
          name: {$first: "$name"},
          totalColumns: {$first: "$totalColumns"},
          totalItems: {$first: "$totalItems"},
          unique_users: {
            $addToSet: "$columns.itens.user_id"
          },
          created_at: {
            $first: "$_created_at"
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          totalColumns: 1,
          totalItems: 1,
          totalUsers: {$size: "$unique_users"},
          created_at: 1
        }
      },
      {$sort: {created_at: -1}}
    ];

    return await query.aggregate(pipeline);
  } catch (error) {
    console.log('Failed to getParticipatingBoards, with error code: ' + error.message);
    throw error;
  }
});

Parse.Cloud.define("updateBoardName", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId, name} = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    // Update board name
    board.set('name', name);

    const result = await board.save(null, {useMasterKey: true});
    return {success: true, result};
  } catch (error) {
    console.error("Error in updateBoardName:", error);
    throw error;
  }
});

Parse.Cloud.define("removeBoard", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const {boardId} = request.params;
    const queryBoard = new Parse.Query("boards");
    queryBoard.equalTo('objectId', boardId);

    const board = await queryBoard.first();
    if (!board) {
      throw new Error("Board not found");
    }

    // Delete the board
    await board.destroy({useMasterKey: true});
    return {success: true};
  } catch (error) {
    console.error("Error in removeBoard:", error);
    throw error;
  }
});

Parse.Cloud.define("createBoard", async (request) => {
  try {
    // Validate JWT token
    await verifyTokenParseCloudFunction(request);

    const { template, is_public, members, pendingInviteEmails } = request.params;
    const Boards = Parse.Object.extend("boards");
    const board = new Boards();

    // Set visibility if provided
    if (typeof is_public !== 'undefined') {
      template.is_public = is_public;
    }

    // Save the board with the provided template
    const boardDatabase = await board.save(template, { useMasterKey: true });

    // Add initial members if provided
    if (members && members.length > 0) {
      const Members = Parse.Object.extend("members");
      for (const m of members) {
        const mem = new Members();
        await mem.save({
          boardId: boardDatabase.id,
          userId: m.id,
          email: m.email,
          name: m.name,
          role: 'Member'
        }, { useMasterKey: true });
      }
    }

    // Send invitations if provided
    if (pendingInviteEmails && pendingInviteEmails.length > 0) {
      for (const email of pendingInviteEmails) {
        try {
          await Parse.Cloud.run("sendBoardInviteEmail", {
            boardId: boardDatabase.id,
            email,
            locale: request.params.locale || 'pt-BR'
          }, { sessionToken: request.sessionToken });
        } catch (inviteError) {
          console.error(`Failed to send invite to ${email} during board creation:`, inviteError);
        }
      }
    }

    return {
      success: true,
      board: boardDatabase
    };
  } catch (error) {
    console.error("Error in createBoard:", error);
    throw error;
  }
});

Parse.Cloud.define("checkMemberEmail", async (request) => {
  try {
    await verifyTokenParseCloudFunction(request);
    const { email } = request.params;

    const query = new Parse.Query("otp");
    query.equalTo("email", email);
    const user = await query.first({ useMasterKey: true });

    if (user) {
      return {
        exists: true,
        id: user.id,
        name: user.get("name"),
        avatar: user.get("avatar")
      };
    }

    return { exists: false };
  } catch (error) {
    console.error("Error in checkMemberEmail:", error);
    throw error;
  }
});

Parse.Cloud.define("sendBoardInviteEmail", async (request) => {
  try {
    await verifyTokenParseCloudFunction(request);
    const { boardId, email, locale } = request.params;
    if (!boardId || !email) throw new Error("Missing parameters");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error("invalid_email_format");
    const inviter = request.user; // request.user might be null if manually calling verifyToken

    // Get inviter info from otp if request.user is just a mock (verifyTokenParseCloudFunction populates request.user)
    const inviterName = request.user?.name || "User";

    // Verify board exists and requester is owner
    const boardQuery = new Parse.Query("boards");
    const board = await boardQuery.get(boardId, { useMasterKey: true });
    if (!board) throw new Parse.Error(404, "Board not found");

    // Find inviter in otp to get name
    const inviterQuery = new Parse.Query("otp");
    const inviterOtp = await inviterQuery.get(request.user.id, { useMasterKey: true });
    const fullInviterName = inviterOtp?.get("name") || inviterName;

    const boardName = board.get("name");

    // Check if user already registered
    const userQuery = new Parse.Query("otp");
    userQuery.equalTo("email", email);
    const existingUser = await userQuery.first({ useMasterKey: true });
    if (existingUser) return { success: false, error: "user_already_registered" };

    // Create invite token
    const token = crypto.randomUUID();
    const BoardInvites = Parse.Object.extend("boardInvites");
    const invite = new BoardInvites();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await invite.save({
      token,
      email,
      boardId,
      invitedBy: request.user.id,
      expiresAt,
      used: false
    }, { useMasterKey: true });

    const frontHost = process.env.FRONT_HOST.endsWith('/') ? process.env.FRONT_HOST.slice(0, -1) : process.env.FRONT_HOST;
    const inviteUrl = `${frontHost}/register?invite=${token}&board=${boardId}`;

    // Add pending member to board members list
    let members = board.get('members') || [];
    if (!members.some(m => m.email === email)) {
      members.push({
        userId: 'pending:' + email,
        email: email,
        name: email,
        pending: true,
        role: 'member'
      });
      board.set('members', members);
      await board.save(null, { useMasterKey: true });
    }

    await sendEmail(email, email, 'BOARD_INVITE', locale || 'pt-BR', {
      boardName,
      inviterName: fullInviterName,
      inviteUrl
    });

    return { success: true };
  } catch (error) {
    console.error("Error in sendBoardInviteEmail:", error);
    throw error;
  }
});

Parse.Cloud.define("acceptBoardInvite", async (request) => {
  try {
    const { token, userId } = request.params;

    const query = new Parse.Query("boardInvites");
    query.equalTo("token", token);
    query.equalTo("used", false);
    query.greaterThan("expiresAt", new Date());
    const invite = await query.first({ useMasterKey: true });

    if (!invite) {
      return { success: false, error: "invalid_or_expired_token" };
    }

    const { boardId, email } = invite.attributes;

    // Get user info
    const userQuery = new Parse.Query("otp");
    const user = await userQuery.get(userId, { useMasterKey: true });
    if (!user) throw new Parse.Error(404, "User not found");

    // Check if already a member in board object
    const boardQuery = new Parse.Query("boards");
    const board = await boardQuery.get(boardId, { useMasterKey: true });
    if (!board) throw new Parse.Error(404, "Board not found");

    let members = board.get('members') || [];

    // Remove any pending placeholders for this email
    members = members.filter(m => !(m.email === email && m.pending === true));

    if (!members.some(m => m.userId === userId)) {
      // Build member object for the board array
      const memberObj = {
        userId,
        email: user.get("email"),
        name: user.get("name"),
        avatar: user.get("avatar"),
        role: 'member'
      };

      members.push(memberObj);
      board.set('members', members);
      await board.save(null, { useMasterKey: true });
    }


    // Mark token as used
    invite.set("used", true);
    await invite.save(null, { useMasterKey: true });

    return { success: true };
  } catch (error) {
    console.error("Error in acceptBoardInvite:", error);
    throw error;
  }
});


// Attachments Cloud Functions
Parse.Cloud.define("createAttachment", async (request) => {
  try {
    await verifyTokenParseCloudFunction(request);
    const {attachment} = request.params;
    if (!attachment || !attachment.userId || !attachment.itemId || !attachment.boardId) {
      throw new Error("Missing attachment required fields");
    }
    const Attachments = Parse.Object.extend("attachments");
    const obj = new Attachments();
    const saved = await obj.save({
      name: attachment.name,
      url: attachment.url,
      size: attachment.size,
      type: attachment.type,
      isImage: !!attachment.isImage,
      userId: attachment.userId,
      boardId: attachment.boardId,
      itemId: attachment.itemId,
      createdAt: attachment.createdAt || new Date().toISOString()
    }, {useMasterKey: true});

    // Increment user's used storage (bytes) in otp collection (best-effort)
    try {
      const otpQuery = new Parse.Query("otp");
      otpQuery.equalTo("objectId", attachment.userId);
      const otp = await otpQuery.first({useMasterKey: true});
      if (otp) {
        const current = otp.get('usedStorage') || 0;
        otp.set('usedStorage', current + (attachment.size || 0));
        await otp.save(null, {useMasterKey: true});
      }
    } catch (e) {
      // log but do not fail the main operation
      console.warn('Failed to update otp usedStorage on createAttachment:', e?.message || e);
    }

    return {
      id: saved.id,
      name: saved.get('name'),
      url: saved.get('url'),
      size: saved.get('size'),
      type: saved.get('type'),
      isImage: saved.get('isImage'),
      userId: saved.get('userId'),
      boardId: saved.get('boardId'),
      itemId: saved.get('itemId'),
      createdAt: saved.get('createdAt')
    };
  } catch (error) {
    console.log('Failed to createAttachment:', error.message);
    throw error;
  }
});

Parse.Cloud.define("getAttachment", async (request) => {
  try {
    await verifyTokenParseCloudFunction(request);
    const {attachmentId} = request.params;
    const Attachments = Parse.Object.extend("attachments");
    const q = new Parse.Query(Attachments);
    q.equalTo("objectId", attachmentId);
    const found = await q.first({useMasterKey: true});
    if (!found) return null;
    return {
      id: found.id,
      name: found.get('name'),
      url: found.get('url'),
      size: found.get('size'),
      type: found.get('type'),
      isImage: found.get('isImage'),
      userId: found.get('userId'),
      boardId: found.get('boardId'),
      itemId: found.get('itemId'),
      createdAt: found.get('createdAt')
    };
  } catch (error) {
    console.log('Failed to getAttachment:', error.message);
    throw error;
  }
});

Parse.Cloud.define("deleteAttachment", async (request) => {
  try {
    await verifyTokenParseCloudFunction(request);
    const {attachmentId} = request.params;
    const Attachments = Parse.Object.extend("attachments");
    const q = new Parse.Query(Attachments);
    q.equalTo("objectId", attachmentId);
    const found = await q.first({useMasterKey: true});
    if (!found) return {success: false, notFound: true};

    const ownerId = found.get('userId');
    const size = found.get('size') || 0;
    await found.destroy({useMasterKey: true});

    try {
      const otpQuery = new Parse.Query("otp");
      otpQuery.equalTo("objectId", ownerId);
      const otp = await otpQuery.first({useMasterKey: true});
      if (otp) {
        const current = otp.get('usedStorage') || 0;
        const newVal = Math.max(0, current - size);
        otp.set('usedStorage', newVal);
        await otp.save(null, {useMasterKey: true});
      }
    } catch (e) {
      console.warn('Failed to update otp usedStorage on deleteAttachment:', e?.message || e);
    }

    return {success: true};
  } catch (error) {
    console.log('Failed to deleteAttachment:', error.message);
    throw error;
  }
});

Parse.Cloud.define("getUserAttachments", async (request) => {
  try {
    await verifyTokenParseCloudFunction(request);
    const {userId, search} = request.params;
    if (!userId || userId !== request.user.id) {
      throw new Parse.Error(403, 'Not authorized');
    }
    const Attachments = Parse.Object.extend("attachments");
    const q = new Parse.Query(Attachments);
    q.equalTo('userId', userId);

    // Add search functionality if search parameter is provided
    if (search && search.trim()) {
      q.matches('name', new RegExp(search.trim(), 'i'));
    }

    q.descending('_created_at');
    const results = await q.find({useMasterKey: true});
    return results.map(a => ({
      id: a.id,
      name: a.get('name'),
      url: a.get('url'),
      size: a.get('size'),
      type: a.get('type'),
      isImage: a.get('isImage'),
      userId: a.get('userId'),
      boardId: a.get('boardId'),
      itemId: a.get('itemId'),
      createdAt: a.get('createdAt')
    }));
  } catch (error) {
    console.log('Failed to getUserAttachments:', error.message);
    throw error;
  }
});

Parse.Cloud.define("getItemAttachments", async (request) => {
  try {
    await verifyTokenParseCloudFunction(request);
    const {itemId} = request.params;
    const Attachments = Parse.Object.extend("attachments");
    const q = new Parse.Query(Attachments);
    q.equalTo('itemId', itemId);
    q.descending('_created_at');
    const results = await q.find({useMasterKey: true});
    return results.map(a => ({
      id: a.id,
      name: a.get('name'),
      url: a.get('url'),
      size: a.get('size'),
      type: a.get('type'),
      isImage: a.get('isImage'),
      userId: a.get('userId'),
      boardId: a.get('boardId'),
      itemId: a.get('itemId'),
      createdAt: a.get('createdAt')
    }));
  } catch (error) {
    console.log('Failed to getItemAttachments:', error.message);
    throw error;
  }
});
