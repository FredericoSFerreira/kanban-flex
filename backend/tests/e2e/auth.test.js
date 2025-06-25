const mockCallFunction = jest.fn();
const mockSet = jest.fn();
const mockSave = jest.fn();

global.Parse = {
  Cloud: {
    run: jest.fn()
  },
  Query: jest.fn().mockImplementation(() => ({
    equalTo: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue({
      set: mockSet,
      save: mockSave,
    }),
  })),
}

jest.unstable_mockModule('./utils/parse-utils.js', () => ({
  callFunction: mockCallFunction
}));

const request = (await import('supertest')).default;
const {default: app} = await import('../../app.js');
const nock = (await import('nock')).default;
let userData = {};

describe('Register Endpoint', () => {
  beforeEach(() => {
    mockCallFunction.mockReset();
    mockSet.mockClear();
    mockSave.mockClear();
    userData = {
      name: 'Novo Usuário',
      email: 'novo@exemplo.com',
      phone: '+5534992281054'
    };
  });

  it('should return 201 Created with success message when registration is successful', async () => {


    Parse.Cloud.run.mockResolvedValue({status: 'success', conflict: false});

    const response = await request(app)
      .post('/register')
      .send(userData);

    expect(response.status).toBe(200);
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });


  it('should return 409 when user already exists', async () => {
    Parse.Cloud.run.mockResolvedValue({status: 'fail', conflict: true});
    const response = await request(app)
      .post('/register')
      .send(userData);

    expect(response.status).toBe(409);
    expect(response.text).toBe('Email already registered');
    expect(Parse.Cloud.run).toHaveBeenCalledTimes(2)
  });

  it('should return 500 when an unexpected error occurs', async () => {

    Parse.Cloud.run.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/register')
      .send(userData);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Occurred error in register otp');

  });
});


describe('Send Otp Endpoint', () => {
  beforeEach(() => {
    mockCallFunction.mockReset();
    mockSet.mockClear();
    mockSave.mockClear();
    userData = {
      email: 'novo@exemplo.com',
    };
  });

  it('should return 201 Created with success send otp code', async () => {


    Parse.Cloud.run.mockResolvedValue({name: 'Jose'});

    const response = await request(app)
      .post('/send-otp')
      .send(userData);

    expect(response.status).toBe(201);
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });


  it('should return 404 when user not exists', async () => {
    Parse.Cloud.run.mockResolvedValue({notFound: true});
    const response = await request(app)
      .post('/send-otp')
      .send(userData);

    expect(response.status).toBe(404);
    expect(response.text).toBe('Email not found');
  });

  it('should return 500 when an unexpected error occurs', async () => {

    Parse.Cloud.run.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/send-otp')
      .send(userData);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Occurred error in send otp');

  });
});


describe('Check Otp Endpoint', () => {
  beforeEach(() => {
    mockCallFunction.mockReset();
    mockSet.mockClear();
    mockSave.mockClear();
    userData = {
      email: 'novo@exemplo.com',
      code: '123'
    };
  });

  it('should return 200 with success in check otp code', async () => {


    Parse.Cloud.run.mockResolvedValue({name: 'Jose', phone: null, id: '123'});

    const response = await request(app)
      .post('/check-otp')
      .send(userData);

    expect(response.status).toBe(200);
  });


  it('should return 403 when code invalid', async () => {
    Parse.Cloud.run.mockResolvedValue(undefined);
    const response = await request(app)
      .post('/check-otp')
      .send(userData);

    expect(response.status).toBe(403);
  });

  it('should return 500 when an unexpected error occurs', async () => {

    Parse.Cloud.run.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/check-otp')
      .send(userData);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Occurred error in check otp');

  });
});


describe('Auth Google Endpoint', () => {
  beforeEach(() => {
    mockCallFunction.mockReset();
    mockSet.mockClear();
    mockSave.mockClear();
    userData = {
      token: 'google-fake-token',
    };
  });

  it('should return 200 with success in check otp code', async () => {

    const fakeUser = {
      sub: '1234567890',
      name: 'João da Silva',
      email: 'joao@gmail.com',
      picture: 'https://foto.com/avatar.jpg',
    };

    nock('https://www.googleapis.com')
      .get('/oauth2/v3/userinfo')
      .reply(200, fakeUser);

    Parse.Cloud.run.mockResolvedValue({name: 'Jose', phone: null, id: '123'});

    const response = await request(app)
      .post('/auth/google')
      .send(userData);

    expect(response.status).toBe(200);
  });


  it('should return 403 when code invalid', async () => {
    const response = await request(app)
      .post('/auth/google')
      .send({});

    expect(response.status).toBe(400);
  });

  it('should return 500 when an unexpected error occurs', async () => {

    Parse.Cloud.run.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/auth/google')
      .send(userData);

    expect(response.status).toBe(401);
    expect(response.body).toStrictEqual({"error": "Invalid token"});

  });
});
