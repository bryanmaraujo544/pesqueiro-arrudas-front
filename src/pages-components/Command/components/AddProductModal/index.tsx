/* eslint-disable no-restricted-globals */
import {
  Dispatch,
  SetStateAction,
  useState,
  useMemo,
  useCallback,
  useContext,
} from 'react';
import { useToast } from '@chakra-ui/react';

import CommandService from 'pages-components/Command/services/CommandService';
import ProductsService from 'pages-components/Command/services/ProductsService';
import { Command } from 'types/Command';
import { formatAmount } from 'utils/formatAmount';
import { Product } from 'types/Product';
import { CommandContext } from 'pages-components/Command';
import { AddProductModalLayout } from './layout';
import { SetAmountModal } from './SetAmountModal';

interface AllProductsAction {
  type: 'ADD-ALL-PRODUCTS' | 'UPDATE-ONE-PRODUCT';
  payload: any;
}
interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  commandId: string | undefined;
  setCommand: Dispatch<SetStateAction<Command>>;
  allProducts: Product[];
  allProductsDispatch: Dispatch<AllProductsAction>;
}

interface ProductNoAmount {
  _id?: string;
  name: string;
  unitPrice: number;
  category: string;
}

export const AddProductModal = ({
  isModalOpen,
  setIsModalOpen,
  commandId,
  setCommand,
  allProducts,
  allProductsDispatch,
}: Props) => {
  const [selectedProducts, setSelectedProducts] = useState([] as any);

  const [isSetAmountModalOpen, setIsSetAmountModalOpen] = useState(false);
  const [productToSetAmount, setProductToSetAmount] = useState<ProductNoAmount>(
    {} as ProductNoAmount
  );
  const [amount, setAmount] = useState('1');

  const [filter, setFilter] = useState('');
  const [searchContent, setSearchContent] = useState('');

  const [isAddingProducts, setIsAddingProducts] = useState(false);
  const [isSelectingProduct, setIsSelectingProduct] = useState(false);

  const { productsDispatch } = useContext(CommandContext);
  const toast = useToast();

  function handleCloseModal() {
    setIsModalOpen(false);
    setIsAddingProducts(false);
    setIsSelectingProduct(false);
  }

  // This function receives the product infos of the product clicked and opens the modal to select the amount of this
  function handleOpenAmountModal({ product }: { product: ProductNoAmount }) {
    setProductToSetAmount(product);
    setIsSetAmountModalOpen(true);
  }

  // This function add in selected products list. Takes the object with infos based on the click of the user,
  // and add the amount propertie containing the amount selected by the user in modal
  async function handleAddProduct(e: any) {
    e.preventDefault();
    try {
      if (isSelectingProduct) {
        return;
      }
      setIsSelectingProduct(true);
      const hasBeenSelected = selectedProducts.some(
        (selectedProduct: any) =>
          selectedProduct.name === productToSetAmount.name
      );
      if (hasBeenSelected) {
        setIsSetAmountModalOpen(false);
        setIsSelectingProduct(false);
        toast.closeAll();
        toast({
          title: 'Produto já foi selecionado',
          status: 'warning',
        });
        return;
      }

      const formattedAmount = Number(
        formatAmount({ num: amount, to: 'point' })
      );
      if (Number.isNaN(formattedAmount)) {
        setIsSelectingProduct(false);
        toast.closeAll();
        toast({
          status: 'error',
          title: 'Número inválido',
          duration: 1000,
          isClosable: true,
        });
        return;
      }

      const { isInStock } = await ProductsService.verifyAmount({
        productId: productToSetAmount?._id as string,
        amount: formattedAmount,
      });

      if (!isInStock) {
        setIsSelectingProduct(false);
        toast.closeAll();
        toast({
          status: 'error',
          title: 'Quantidade acima do estoque disponível',
          duration: 2000,
          isClosable: true,
        });
        return;
      }

      setSelectedProducts((prev: any) => [
        ...prev,
        {
          ...productToSetAmount,
          amount: formattedAmount.toString(),
          totalPayed: 0,
        },
      ]);
      setIsSetAmountModalOpen(false);
      setIsSelectingProduct(false);
    } catch (error: any) {
      setIsSelectingProduct(false);
      toast.closeAll();
      toast({
        status: 'error',
        title: error?.response?.data?.message,
        duration: 2000,
        isClosable: true,
      });
    }
  }

  function handleRemoveSelectedProduct({ id }: { id: string }) {
    setSelectedProducts((prev: any) =>
      prev.filter((product: any) => product._id !== id)
    );
  }

  async function handleAddProductsInCommand() {
    try {
      if (isAddingProducts) {
        return;
      }
      setIsAddingProducts(true);

      // Grab command infos to get the products array and push all of selectedProducts in it.
      const { command } = await CommandService.getOneCommand({ commandId });
      const hasSomeSelectedProductInCommand = command.products.find(
        (product: any) =>
          selectedProducts.some(
            (selectedProduct: any) => selectedProduct.name === product.name
          )
      );

      if (hasSomeSelectedProductInCommand) {
        setIsAddingProducts(false);
        toast.closeAll();
        toast({
          title: `O produto: ${hasSomeSelectedProductInCommand.name} já está na comanda`,
          status: 'error',
          duration: 2000,
        });
        return;
      }

      const newProducts = [...command.products, ...selectedProducts];

      // ADD THIS PRODUCTS IN COMMAND IN MONGODB DATABASE
      const { command: updatedCommand } = await CommandService.updateCommand({
        _id: commandId,
        products: newProducts,
      });
      // SOCKET.IO -> broadcast the command products was updated

      setCommand(updatedCommand);
      productsDispatch({
        type: 'add-products',
        payload: updatedCommand.products,
      });

      // Diminish the amount of products selected in stock
      selectedProducts.forEach(
        (selectedProduct: { _id: string; amount: string }) => {
          (async () => {
            const { product: stockUpdatedProduct } =
              await ProductsService.diminishAmount({
                productId: selectedProduct._id,
                amount: Number(selectedProduct.amount),
              });

            // Updating the AddProductModal list of stock products with new updtedProduc amount
            allProductsDispatch({
              type: 'UPDATE-ONE-PRODUCT',
              payload: { product: stockUpdatedProduct },
            });
          })();
        }
      );

      // TODO: Broadcast to necessary entities the update of command

      cleanModalValues();
      toast.closeAll();
      toast({
        status: 'success',
        title: 'Produtos adicionados',
        duration: 2000,
        isClosable: true,
      });
      handleCloseModal();
    } catch (error: any) {
      setIsAddingProducts(false);
      toast.closeAll();
      toast({
        status: 'error',
        title: error?.response?.data?.message,
        duration: 2000,
        isClosable: true,
      });
    }
  }

  const cleanModalValues = useCallback(() => {
    setSelectedProducts([]);
    setAmount('1');
    setFilter('');
    setSearchContent('');
  }, []);

  function handleChangeFilter(selectedFilter: string) {
    setFilter((prevFilter) => {
      if (selectedFilter === prevFilter) {
        return '';
      }
      return selectedFilter;
    });
  }

  const filteredByFilter = useMemo(() => {
    if (filter === '') {
      return allProducts;
    }
    const filtered = allProducts.filter(({ category }) => category === filter);
    return filtered;
  }, [filter, allProducts]);

  const filteredBySearch = useMemo(() => {
    const filtered = filteredByFilter.filter((product: any) => {
      const productObjStr = Object.values(product).join('').toLocaleLowerCase();
      if (productObjStr?.includes(searchContent.toLowerCase())) {
        return true;
      }
      return false;
    });
    return filtered;
  }, [filteredByFilter, searchContent]);

  return (
    <>
      <AddProductModalLayout
        products={filteredBySearch}
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        selectedProducts={selectedProducts}
        handleOpenAmountModal={handleOpenAmountModal}
        handleRemoveSelectedProduct={handleRemoveSelectedProduct}
        handleAddProductsInCommand={handleAddProductsInCommand}
        filter={filter}
        handleChangeFilter={handleChangeFilter}
        searchContent={searchContent}
        setSearchContent={setSearchContent}
        isAddingProducts={isAddingProducts}
      />
      {/* Set amount of product modal */}
      <SetAmountModal
        isSetAmountModalOpen={isSetAmountModalOpen}
        setIsSetAmountModalOpen={setIsSetAmountModalOpen}
        amount={amount}
        setAmount={setAmount}
        handleAddProduct={handleAddProduct}
        isFishesCategory={
          productToSetAmount?.category?.toLowerCase() === 'peixes'
        }
        isSelectingProduct={isSelectingProduct}
      />
    </>
  );
};
