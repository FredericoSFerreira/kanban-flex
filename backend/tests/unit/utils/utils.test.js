await jest.unstable_mockModule('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mocked.jwt.token')
  }))
}));

const { generateOtp, generateToken, generateBoardSummaryPrompt, parseBoolean, escapeRegex, generateTrackingHistory, getDefaultUrlAvatar, getFirstAndLastName } = await import('../../../utils/utils.js');
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

describe('escapeRegex', () => {
  it('should escape special regex characters', () => {
    expect(escapeRegex('hello.world')).toBe('hello\\.world');
    expect(escapeRegex('test*test')).toBe('test\\*test');
    expect(escapeRegex('a+b')).toBe('a\\+b');
    expect(escapeRegex('a?b')).toBe('a\\?b');
    expect(escapeRegex('a^b')).toBe('a\\^b');
    expect(escapeRegex('a$b')).toBe('a\\$b');
    expect(escapeRegex('a{b')).toBe('a\\{b');
    expect(escapeRegex('a}b')).toBe('a\\}b');
    expect(escapeRegex('a(b')).toBe('a\\(b');
    expect(escapeRegex('a)b')).toBe('a\\)b');
    expect(escapeRegex('a|b')).toBe('a\\|b');
    expect(escapeRegex('a[b')).toBe('a\\[b');
    expect(escapeRegex('a]b')).toBe('a\\]b');
    expect(escapeRegex('a\\b')).toBe('a\\\\b');
  });

  it('should not modify non-special characters', () => {
    expect(escapeRegex('hello world')).toBe('hello world');
    expect(escapeRegex('abc123')).toBe('abc123');
  });

  it('should handle empty string', () => {
    expect(escapeRegex('')).toBe('');
  });
});

// Testing each function one by one
describe('getFirstAndLastName', () => {
  it('should return first and last name for a full name', () => {
    const user = { name: 'John Doe Smith' };
    expect(getFirstAndLastName(user)).toBe('John Smith');
  });

  it('should return just the name if only one name is provided', () => {
    const user = { name: 'John' };
    expect(getFirstAndLastName(user)).toBe('John');
  });

  it('should handle names with multiple spaces', () => {
    const user = { name: 'John  Doe  Smith' };
    expect(getFirstAndLastName(user)).toBe('John Smith');
  });

  it('should handle empty name', () => {
    const user = { name: '' };
    expect(getFirstAndLastName(user)).toBe('');
  });

  it('should handle undefined name', () => {
    const user = { };
    expect(getFirstAndLastName(user)).toBe('undefined undefined');
  });

  it('should handle null user', () => {
    expect(getFirstAndLastName(null)).toBe('undefined undefined');
  });
});

// Testing getDefaultUrlAvatar
describe('getDefaultUrlAvatar', () => {
  it('should generate correct URL for a user with full name', () => {
    const user = { name: 'John Doe Smith' };
    expect(getDefaultUrlAvatar(user)).toBe('https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=John Smith');
  });

  it('should generate correct URL for a user with single name', () => {
    const user = { name: 'John' };
    expect(getDefaultUrlAvatar(user)).toBe('https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=John');
  });

  it('should handle empty name', () => {
    const user = { name: '' };
    expect(getDefaultUrlAvatar(user)).toBe('https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=');
  });

  it('should handle undefined name', () => {
    const user = { };
    expect(getDefaultUrlAvatar(user)).toBe('https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=undefined undefined');
  });

  it('should handle null user', () => {
    expect(getDefaultUrlAvatar(null)).toBe('https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=undefined undefined');
  });
});

// Testing generateTrackingHistory
describe('generateTrackingHistory', () => {
  let originalDate;

  beforeEach(() => {
    // Save the original Date constructor
    originalDate = global.Date;
    // Mock Date to return a fixed timestamp
    global.Date = jest.fn(() => new originalDate('2023-01-01T12:00:00Z'));
    global.Date.now = jest.fn(() => new originalDate('2023-01-01T12:00:00Z').getTime());
  });

  afterEach(() => {
    // Restore the original Date constructor
    global.Date = originalDate;
  });

  it('should generate tracking history with user information', () => {
    const request = {
      user: {
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg'
      }
    };
    const action = 'move_card';
    const data = { source: { columnId: 'col1' }, target: { columnId: 'col2' } };

    const result = generateTrackingHistory(request, action, data);

    expect(result).toEqual({
      user: {
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg'
      },
      action: 'move_card',
      timestamp: new Date('2023-01-01T12:00:00Z'),
      data: { source: { columnId: 'col1' }, target: { columnId: 'col2' } }
    });
  });

  it('should use default avatar if user has no avatar', () => {
    const request = {
      user: {
        name: 'John Doe'
      }
    };
    const action = 'move_card';
    const data = { source: { columnId: 'col1' }, target: { columnId: 'col2' } };

    const result = generateTrackingHistory(request, action, data);

    expect(result.user.avatar).toBe('https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=John Doe');
  });

  it('should use "Sistema" as name if user is not provided', () => {
    const request = {};
    const action = 'system_action';
    const data = { info: 'system info' };

    const result = generateTrackingHistory(request, action, data);

    expect(result.user.name).toBe('Sistema');
    expect(result.action).toBe('system_action');
    expect(result.data).toEqual({ info: 'system info' });
  });
});
