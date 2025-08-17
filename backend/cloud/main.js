import {UAParser} from 'ua-parser-js';
import {verifyTokenParseCloudFunction} from "../middleware/auth.js";
import {escapeRegex, generateTrackingHistory} from "../utils/utils.js";
import {callFunction} from "../utils/parse-utils.js";
import {deleteFileFromS3} from "../service/s3-service.js";


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

Parse.Cloud.define("checkOtp", async (request) => {
  try {
    const query = new Parse.Query("otp");
    query.equalTo({'email': request.params.email, 'code': request.params.code})
    // Add check for active=true
    query.equalTo('active', true);

    const otp = await query.first();
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
    return await query.find();
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
    return otp.save();
  });
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
    return await query.first();
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

    // Build match condition
    const matchCondition = {
      "owner_id": {$not: {$eq: userId}},
      "columns.itens.user_id": userId
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

    const {template} = request.params;
    const Boards = Parse.Object.extend("boards");
    const board = new Boards();

    // Save the board with the provided template
    const boardDatabase = await board.save(template, {useMasterKey: true});

    return {
      success: true,
      board: boardDatabase
    };
  } catch (error) {
    console.error("Error in createBoard:", error);
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
    if (ownerId !== request.user.id) {
      throw new Parse.Error(403, 'Not authorized to delete this attachment');
    }

    const size = found.get('size') || 0;
    await found.destroy({useMasterKey: true});

    // Decrement user's used storage in otp (best-effort)
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
    const {userId} = request.params;
    if (!userId || userId !== request.user.id) {
      throw new Parse.Error(403, 'Not authorized');
    }
    const Attachments = Parse.Object.extend("attachments");
    const q = new Parse.Query(Attachments);
    q.equalTo('userId', userId);
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
