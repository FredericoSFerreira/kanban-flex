await jest.unstable_mockModule('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mocked.jwt.token')
  }))
}));

const { generateOtp, generateToken, generateBoardSummaryPrompt, parseBoolean } = await import('../../../utils/utils.js');
const { SignJWT } = await import('jose');

describe('generateOtp', () => {
  it('should generate a 6-digit OTP as a string', () => {
    const otp = generateOtp();
    expect(otp).toHaveLength(6);
    expect(typeof otp).toBe('string');
    expect(Number.isNaN(Number(otp))).toBe(false);
  });
});

describe('generateToken', () => {
  it('should generate a signed JWT token', async () => {
    const payload = { userId: '123' };
    const token = await generateToken(payload);
    expect(token).toBe('mocked.jwt.token');
    expect(SignJWT).toHaveBeenCalledWith(payload);
  });
});

describe('generateBoardSummaryPrompt', () => {
  it('should generate the board summary correctly', () => {
    const board = {
      name: 'Sprint 1',
      columns: [
        {
          name: 'To Do',
          itens: [
            { title: 'Task 1', description: 'Description 1', labels: [] },
            { title: '', description: '', labels: [] },
          ]
        },
        {
          name: 'Done',
          itens: [
            { title: 'Task 2', description: 'Description 2', labels: [] },
          ]
        }
      ]
    };

    const prompt = generateBoardSummaryPrompt(board);

    expect(prompt).toContain('Board: Sprint 1');
    expect(prompt).toContain('Coluna: To Do');
    expect(prompt).toContain('Título: Task 1');
    expect(prompt).toContain('Título: Sem título');
    expect(prompt).toContain('Coluna: Done');
    expect(prompt).toContain('Descrição: Description 2');
  });
});

describe('parseBoolean', () => {
  it('should convert "true" to true', () => {
    expect(parseBoolean('true')).toBe(true);
  });

  it('should convert "false" to false', () => {
    expect(parseBoolean('false')).toBe(false);
  });

  it('should return undefined for other values', () => {
    expect(parseBoolean('yes')).toBeUndefined();
    expect(parseBoolean('')).toBeUndefined();
    expect(parseBoolean(null)).toBeUndefined();
  });
});
