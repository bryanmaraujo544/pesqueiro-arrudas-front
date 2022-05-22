import { CommandsContext } from 'pages-components/Commands';
import { useCallback, useContext } from 'react';
import { NavHeaderLayout } from './layout';

export const NavHeader = () => {
  const { filter, setFilter, orderBy, setOrderBy } =
    useContext(CommandsContext);

  console.log({ filter, orderBy });

  const handleChangeFilter = useCallback(
    (newFilter: string) => {
      setFilter((prev) => (prev === newFilter ? '' : newFilter));
    },
    [setFilter]
  );
  const handleChangeOrderBy = useCallback(
    (newOrderBy: string) => {
      setOrderBy((prev) => (prev === newOrderBy ? '' : newOrderBy));
    },
    [setOrderBy]
  );

  return (
    <NavHeaderLayout
      handleChangeFilter={handleChangeFilter}
      handleChangeOrderBy={handleChangeOrderBy}
      filter={filter}
      orderBy={orderBy}
    />
  );
};
