import { v4 as uuidv4 } from 'uuid';

const uniqueId = () => {
  return uuidv4()
};

export {uniqueId}
