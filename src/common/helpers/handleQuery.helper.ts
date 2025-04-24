import { PaginationDTO } from '../dto/Pagination.dto';

export const handleQuery = (_query: any) => {
  const paginationDto: PaginationDTO = {
    limit: _query['limit'],
    page: _query['page'],
  };

  delete _query['limit'];
  delete _query['page'];

 //const { limit = 10, page = 0 } = paginationDto;

  let q = {};
  for (const queryKey of Object.keys(_query)) {
    q[queryKey] = _query[queryKey];
  }

  return { paginationDto, q };
};
