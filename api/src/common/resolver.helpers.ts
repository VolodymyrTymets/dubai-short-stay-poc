import { set } from 'lodash';
import { PaginationInput } from './input/pagination.input';

enum OrderDirection {
  asc = 'asc',
  desc = 'desc',
}
type Order = Record<string, Record<string, OrderDirection> | OrderDirection>;

export const transformPagination = (
  pagination: PaginationInput,
  parser?: (field: string, orderOrderDirection, orderByField: Order) => any,
) => {
  const { skip, take, orderBy: _orderBy } = pagination;
  const orderBy: Record<string, OrderDirection>[] = _orderBy.reduce(
    (acc, { field, order }) => {
      const orderByField = set({}, field, order);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      acc.push(parser ? parser(field, order, orderByField) : orderByField);
      return acc;
    },
    [],
  );
  return { skip, ...(take ? { take } : {}), orderBy };
};

export const transformFullTextSearch = (slug: string) => {
  return (
    slug &&
    slug
      .trimStart()
      .trimEnd()
      .split(' ')
      .map((word) => `${word}`)
      .join(' | ')
      .concat(':*')
  );
};
