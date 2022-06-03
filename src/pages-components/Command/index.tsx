/* eslint-disable react/jsx-no-constructed-context-values */
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';

import { productsReducer } from './reducers/productsReducer';
import { AddProductModal } from './components/AddProductModal';
import { DeleteProductModal } from './components/DeleteProductModal';
import { CommandLayout } from './layout';
import CommandService from './services/CommandService';
import { useToast } from '@chakra-ui/react';

const mockCommands = [
  {
    id: 'kjfd3343kdkkklldxdJ',
    table: 'João Gomes',
    waiter: 'Diego',
    total: 458.9,
    products: [
      {
        id: 'coca123',
        name: 'Coca-Cola',
        category: 'Bebidas',
        amount: 5,
        unitPrice: 7.9,
      },
      {
        id: 'skol123',
        name: 'Skol 700ml',
        category: 'Bebidas',
        amount: 12,
        unitPrice: 5.5,
      },
      {
        id: 'fritas123',
        name: 'Porção Batata Frita',
        category: 'Porções',
        amount: 2,
        unitPrice: 32.5,
      },
      {
        id: 'peixe123',
        name: 'Peixe Baiacu',
        category: 'Peixes',
        amount: 3,
        unitPrice: 24.5,
      },
    ],
  },
  {
    id: 3,
    table: 'João Gomes',
    waiter: 'Diego',
    total: 458.9,
  },
  {
    id: 4,
    table: 'Mbappé',
    waiter: 'Diego',
    total: 4580.9,
  },
  {
    id: 5,
    table: 'Neymar',
    waiter: 'Júlio',
    total: 1259.9,
  },
  {
    id: 6,
    table: 'Amanda vermelho',
    waiter: 'Bryan',
    total: 458.9,
  },
  {
    id: 7,
    table: 'João Gomes',
    waiter: 'Diego',
    total: 358.9,
  },
];

type ContextProps = {
  products: { value: any[] };
  productsDispatch: any;
  isDeleteProductModalOpen: boolean;
  setIsDeleteProductModalOpen: Dispatch<SetStateAction<boolean>>;
  productIdToDelete: string;
  setProductIdToDelete: Dispatch<SetStateAction<string>>;
  setIsAddProductModalOpen: Dispatch<SetStateAction<boolean>>;
  // eslint-disable-next-line no-unused-vars
  handleOpenDeleteModal: ({ productId }: { productId: string }) => void;
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
  orderBy: string;
  setOrderBy: Dispatch<SetStateAction<string>>;
  orderByDir: 'asc' | 'desc';
  setOrderByDir: Dispatch<SetStateAction<'asc' | 'desc'>>;
  searchContent: string;
  setSearchContent: Dispatch<SetStateAction<string>>;
};

export const CommandContext = createContext({} as ContextProps);

type Props = {
  commandId: string;
};

const initialState = {
  value: [] as any[],
};

export const Command = ({ commandId }: Props) => {
  const [command, setCommand] = useState({});
  const [products, productsDispatch] = useReducer(
    productsReducer,
    initialState
  );

  const [productIdToDelete, setProductIdToDelete] = useState('');

  const [filter, setFilter] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [orderByDir, setOrderByDir] = useState('' as 'asc' | 'desc');
  const [searchContent, setSearchContent] = useState('');

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] =
    useState(false);

  const toast = useToast();

  useEffect(() => {
    (async () => {
      const [commandFound] = mockCommands.filter(
        ({ id }) => id.toString() === commandId
      );

      try {
        // Grab command informations from database
        const { command: commandFound, message } =
          await CommandService.getOneCommand({
            commandId,
          });
        setCommand(commandFound);

        productsDispatch({
          type: 'add-products',
          payload: commandFound?.products,
        });

        toast.closeAll();
      } catch (error: any) {
        toast({
          status: 'error',
          title: error?.response?.data?.message,
          duration: 2000,
          isClosable: true,
        });
      }
    })();
  }, [commandId]);

  const handleOpenDeleteModal = useCallback(
    ({ productId }: { productId: string }) => {
      setProductIdToDelete(productId);
      setIsDeleteProductModalOpen(true);
    },
    []
  );

  return (
    <CommandContext.Provider
      value={{
        productsDispatch,
        products,
        isDeleteProductModalOpen,
        setIsDeleteProductModalOpen,
        setIsAddProductModalOpen,
        productIdToDelete,
        setProductIdToDelete,
        handleOpenDeleteModal,
        filter,
        setFilter,
        orderBy,
        setOrderBy,
        orderByDir,
        setOrderByDir,
        searchContent,
        setSearchContent,
      }}
    >
      <CommandLayout command={command} />
      <DeleteProductModal
        isModalOpen={isDeleteProductModalOpen}
        setIsModalOpen={setIsDeleteProductModalOpen}
      />
      <AddProductModal
        isModalOpen={isAddProductModalOpen}
        setIsModalOpen={setIsAddProductModalOpen}
      />
    </CommandContext.Provider>
  );
};
