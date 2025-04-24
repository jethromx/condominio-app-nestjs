

import { validate, version } from 'uuid';

export const isValidUUIDv4 = (id: string): boolean => {
  return validate(id) && version(id) === 4;
}

