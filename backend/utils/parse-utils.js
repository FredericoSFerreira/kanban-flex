export const callFunction = async (functionName, params = {}, options= {}) => {
  try {
    return await Parse.Cloud.run(functionName, params, options)
  } catch (error) {
    throw error
  }
}
