import { callFunction } from '../../../utils/parse-utils.js'

global.Parse = {
  Cloud: {
    run: jest.fn()
  }
}

describe('parse-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('callFunction', () => {
    it('should call Parse.Cloud.run with the correct parameters and return the result', async () => {
      // Arrange
      const functionName = 'testFunction'
      const params = { test: 'value' }
      const options = { sessionToken: 'token123' }
      const expectedResult = { success: true, data: 'test' }

      Parse.Cloud.run.mockResolvedValue(expectedResult)

      // Act
      const result = await callFunction(functionName, params, options)

      // Assert
      expect(Parse.Cloud.run).toHaveBeenCalledWith(functionName, params, options)
      expect(Parse.Cloud.run).toHaveBeenCalledTimes(1)
      expect(result).toEqual(expectedResult)
    })

    it('should default to empty parameters when not provided', async () => {
      // Arrange
      const functionName = 'testFunction'
      const expectedResult = { success: true }

      Parse.Cloud.run.mockResolvedValue(expectedResult)

      // Act
      const result = await callFunction(functionName)

      // Assert
      expect(Parse.Cloud.run).toHaveBeenCalledWith(functionName, {}, {})
      expect(result).toEqual(expectedResult)
    })

    it('should propagate errors when Parse.Cloud.run fails', async () => {
      // Arrange
      const functionName = 'testFunction'
      const params = { test: 'value' }
      const error = new Error('Parse error')

      Parse.Cloud.run.mockRejectedValue(error)

      // Act & Assert
      await expect(callFunction(functionName, params)).rejects.toThrow('Parse error')
      expect(Parse.Cloud.run).toHaveBeenCalledWith(functionName, params, {})
    })

    it('should work only with functionName and params', async () => {
      // Arrange
      const functionName = 'testFunction'
      const params = { test: 'value' }
      const expectedResult = { success: true }

      Parse.Cloud.run.mockResolvedValue(expectedResult)

      // Act
      const result = await callFunction(functionName, params)

      // Assert
      expect(Parse.Cloud.run).toHaveBeenCalledWith(functionName, params, {})
      expect(result).toEqual(expectedResult)
    })

    it('should handle different types of Parse errors', async () => {
      // Arrange
      const functionName = 'testFunction'
      const parseError = {
        code: 141,
        message: 'Invalid function'
      }

      Parse.Cloud.run.mockRejectedValue(parseError)

      // Act & Assert
      await expect(callFunction(functionName)).rejects.toEqual(parseError)
    })
  })
})
