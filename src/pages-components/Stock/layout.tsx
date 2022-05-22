import { SetStateAction, Dispatch } from 'react';
import { Heading, Icon } from '@chakra-ui/react';
import { MdOutlineAddBox } from 'react-icons/md';

import { Button } from 'components/Button';
import { Header } from 'components/Header';
import { Layout } from 'components/Layout';
import { NavHeader } from './components/NavHeader';
import { ItemsTable } from './components/ItemsTable';

interface Props {
  filters: string;
  setFilters: Dispatch<SetStateAction<string>>;
  orderBy: string;
  setOrderBy: Dispatch<SetStateAction<string>>;
  setIsAddItemModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const StockLayout = ({
  filters,
  setFilters,
  orderBy,
  setOrderBy,
  setIsAddItemModalOpen,
}: Props) => (
  <Layout>
    <Header>
      <Button
        onClick={() => setIsAddItemModalOpen(true)}
        isCallAction
        h="100%"
        w="100%"
      >
        <Icon as={MdOutlineAddBox} />
        Adicionar Item
      </Button>
    </Header>
    <Heading mb={8} color="blue.800" fontSize={[16, 20, 24, 32]}>
      Estoque
    </Heading>
    <NavHeader
      filters={filters}
      setFilters={setFilters}
      orderBy={orderBy}
      setOrderBy={setOrderBy}
    />
    <ItemsTable />
  </Layout>
);
