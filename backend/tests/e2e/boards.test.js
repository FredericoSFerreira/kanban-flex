const mockCallFunction = jest.fn();

await jest.unstable_mockModule('./service/redis-service.js', () => ({
  getRedisClient: jest.fn()
}));

jest.unstable_mockModule('./utils/parse-utils.js', () => ({
  callFunction: mockCallFunction
}));

jest.unstable_mockModule('./middleware/auth.js', () => ({
  verifyToken: (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({msg: 'Token not pass'});
    }

    req.user = {id: 'mock-user-id', name: 'Mock User'};
    req.token = 'fake-token';
    next();
  }
}));


const request = (await import('supertest')).default;
const {default: app} = await import('../../app.js');
const nock = (await import('nock')).default;
const {getRedisClient} = await import('../../service/redis-service.js');

const mockBoards = [
  {
    id: 'board1',
    name: 'Sprint Retrospective 1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: 'mock-user-id'
  },
  {
    id: 'board2',
    name: 'Sprint Retrospective 2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: 'mock-user-id'
  }
];

const mockParticipatingBoards = [
  {
    "name": "Modelo - Gestão de Projetos",
    "totalColumns": 2,
    "totalItems": 1,
    "created_at": "2025-06-25T12:13:10.141Z",
    "totalUsers": 1,
    "objectId": "eUfGwVD63Y"
  },
  {
    "name": "Problemas e serem resolvidos",
    "totalColumns": 3,
    "totalItems": 7,
    "created_at": "2025-06-23T15:02:06.493Z",
    "totalUsers": 1,
    "objectId": "zUNiY9mLKs"
  }
]

const mockStatsBoards = {
  "board_info": [
    {
      "_id": "eUfGwVD63Y",
      "boardName": "Modelo - Gestão de Projetos",
      "totalColumns": 2,
      "totalItems": 1
    }
  ],
  "unique_users": [
    {
      "name": "Frederico",
      "avatar": "https://lh3.googleusercontent.com/a/ACg8ocIpvnpHVQvArVkL36YK-irF2Z2k-ckY_fxSUpucKMN_H3ziOplmZg=s96-c",
      "user_id": "snGAHpmCBF"
    }
  ],
  "top_liked_card": [
    {
      "id": "a172b126-2408-488f-8a2d-99afa583dde0",
      "name": "Frederico",
      "user_id": "snGAHpmCBF",
      "avatar": "https://lh3.googleusercontent.com/a/ACg8ocIpvnpHVQvArVkL36YK-irF2Z2k-ckY_fxSUpucKMN_H3ziOplmZg=s96-c",
      "title": "Evoluir Api",
      "description": ".",
      "labels": [],
      "up_vote": 0,
      "down_vote": 0,
      "up_vote_users": [],
      "down_vote_users": [],
      "comments": []
    }
  ],
  "top_disliked_card": [
    {
      "id": "a172b126-2408-488f-8a2d-99afa583dde0",
      "name": "Frederico",
      "user_id": "snGAHpmCBF",
      "avatar": "https://lh3.googleusercontent.com/a/ACg8ocIpvnpHVQvArVkL36YK-irF2Z2k-ckY_fxSUpucKMN_H3ziOplmZg=s96-c",
      "title": "Evoluir Api",
      "description": ".",
      "labels": [],
      "up_vote": 0,
      "down_vote": 0,
      "up_vote_users": [],
      "down_vote_users": [],
      "comments": []
    }
  ],
  "top_commented_card": [
    {
      "id": "a172b126-2408-488f-8a2d-99afa583dde0",
      "name": "Frederico",
      "user_id": "snGAHpmCBF",
      "avatar": "",
      "title": "Evoluir Api",
      "description": ".",
      "labels": [],
      "up_vote": 0,
      "down_vote": 0,
      "up_vote_users": [],
      "down_vote_users": [],
      "comments": []
    }
  ],
  "totals": [
    {
      "total_likes": 0,
      "total_dislikes": 0,
      "total_comments": 0
    }
  ],
  "label_counts": []
}

const mockBoardSummary = {
  attributes: {
    name: 'test',
    columns: [{
      name: 'xpto',
      itens: [
        {
          title: 'xpto',
          description: 'xpto',
        }
      ]
    }
    ]
  }
}
describe('My Boards Endpoint', () => {
  beforeEach(() => {
    mockCallFunction.mockReset();
  });
  it('should return 200 OK with boards data when authenticated', async () => {
    mockCallFunction.mockResolvedValue(mockBoards);

    const response = await request(app)
      .get('/my-boards')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('id', 'board1');
    expect(response.body[0]).toHaveProperty('name', 'Sprint Retrospective 1');
    expect(response.body[0]).toHaveProperty('owner', 'mock-user-id');
    expect(response.body[1]).toHaveProperty('id', 'board2');
    expect(response.body[1]).toHaveProperty('name', 'Sprint Retrospective 2');

    expect(mockCallFunction).toHaveBeenCalledWith(
      'getMyBoards',
      {id: 'mock-user-id', name: 'Mock User'},
      'fake-token'
    );
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/my-boards');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('msg', 'Token not pass');

    expect(mockCallFunction).not.toHaveBeenCalled();
  });

  it('should return 500 when an error occurs', async () => {
    mockCallFunction.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/my-boards')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Occurred error in get my board');

    expect(mockCallFunction).toHaveBeenCalledWith(
      'getMyBoards',
      {id: 'mock-user-id', name: 'Mock User'},
      'fake-token'
    );
  });
});


describe('Participating Boards Endpoint', () => {
  beforeEach(() => {
    mockCallFunction.mockReset();
  });
  it('should return 200 OK with boards data when authenticated', async () => {
    mockCallFunction.mockResolvedValue(mockParticipatingBoards);

    const response = await request(app)
      .get('/boards/participating')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);

    expect(mockCallFunction).toHaveBeenCalledWith(
      'getParticipatingBoards',
      {userId: 'mock-user-id'},
      'fake-token'
    );
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/boards/participating');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('msg', 'Token not pass');

    expect(mockCallFunction).not.toHaveBeenCalled();
  });

  it('should return 500 when an error occurs', async () => {
    mockCallFunction.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/boards/participating')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Occurred error in get participating boards');

    expect(mockCallFunction).toHaveBeenCalledWith(
      'getParticipatingBoards',
      {userId: 'mock-user-id'},
      'fake-token'
    );
  });
});


describe('Get Boards Stats Endpoint', () => {
  beforeEach(() => {
    mockCallFunction.mockReset();
  });
  it('should return 200 OK with boards data when authenticated', async () => {
    mockCallFunction.mockResolvedValue(mockStatsBoards);

    const response = await request(app)
      .get('/boards/stats/123')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('board_info');

    expect(mockCallFunction).toHaveBeenCalledWith(
      'getBoardStats',
      {id: '123'},
      'fake-token'
    );
  });


  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/boards/stats/123');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('msg', 'Token not pass');

    expect(mockCallFunction).not.toHaveBeenCalled();
  });

  it('should return 500 when an error occurs', async () => {
    mockCallFunction.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/boards/stats/123')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Occurred error in get stats board');

    expect(mockCallFunction).toHaveBeenCalledWith(
      'getBoardStats',
      {id: '123'},
      'fake-token'
    );
  });
});

describe('Get Board Summary Endpoint', () => {
  beforeEach(() => {
    mockCallFunction.mockReset();
    jest.clearAllMocks();
    mockRedisClient = {
      get: jest.fn(),
      incr: jest.fn(),
      set: jest.fn()
    };
    getRedisClient.mockResolvedValue(mockRedisClient);

  });
  it('should return 200 OK with sumary board data when authenticated', async () => {
    mockCallFunction.mockResolvedValue(mockBoardSummary);


    const fakeAIResult = {
      "id": "chatcmpl",
      "object": "chat.completion",
      "created": 1750873447,
      "model": "llama-3.1-8b-instant",
      "choices": [
        {
          "index": 0,
          "message": {
            "role": "assistant",
            "content": "Board summary here"
          },
          "logprobs": null,
          "finish_reason": "stop"
        }
      ],
      "usage": {},
      "usage_breakdown": null,
      "system_fingerprint": null,
      "x_groq": {}
    };

    nock('https://api.groq.com')
      .post('/openai/v1/chat/completions')
      .reply(200, fakeAIResult);


    const response = await request(app)
      .get('/boards/summary/123?retry=true')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);

    expect(mockCallFunction).toHaveBeenCalledWith(
      'getBoardById',
      {id: '123'},
      'fake-token'
    );
  });

  it('should return 200 OK with sumary board cache data', async () => {

    mockRedisClient.get.mockResolvedValue(JSON.stringify({summary: 'board summary'}));

    const response = await request(app)
      .get('/boards/summary/123?retry=false')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(getRedisClient).toHaveBeenCalled();
    expect(response.body).toBeInstanceOf(Object);
  });


  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/boards/summary/123?retry=true');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('msg', 'Token not pass');

    expect(mockCallFunction).not.toHaveBeenCalled();
  });

  it('should return 500 when an error occurs', async () => {
    mockCallFunction.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/boards/summary/123?retry=true')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Occurred error in get board summary');

    expect(mockCallFunction).toHaveBeenCalledWith(
      'getBoardById',
      {id: '123'},
      'fake-token'
    );
  });
});

