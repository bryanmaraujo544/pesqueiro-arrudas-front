import { useToast } from '@chakra-ui/react';
import { CommandsContext } from 'pages-components/Commands';
import CommandsService from 'pages-components/Commands/services/CommandsService';
import ProductsService from 'pages-components/Commands/services/ProductsService';
import {
  Dispatch,
  SetStateAction,
  useState,
  useMemo,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { formatAmount } from 'utils/formatAmount';
import { AddProductModalLayout } from './layout';
import { SetAmountModal } from './SetAmountModal';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  commandId: string;
}

interface ProductNoAmount {
  _id?: string;
  name: string;
  unitPrice: number;
  category: string;
}

export const AddProductsModal = ({
  isModalOpen,
  setIsModalOpen,
  commandId,
}: Props) => {
  // const [allProducts, setAllProducts] = useState([]);
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

  const {
    allCommandsDispatch,
    stockProducts: allProducts,
    stockProductsDispatch,
  } = useContext(CommandsContext);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const products = await ProductsService.getAllProducts();
      stockProductsDispatch({ type: 'ADD-ALL-PRODUCTS', payload: products });
    })();
  }, [stockProductsDispatch]);

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
      // TODO: check if there are enough amount of product selected in stock
      const hasBeenSelected = selectedProducts.some(
        (selectedProduct: any) =>
          selectedProduct.name === productToSetAmount.name
      );

      if (hasBeenSelected) {
        toast.closeAll();
        toast({
          title: 'Produto já foi selecionado',
          status: 'warning',
          duration: 1000,
          isClosable: true,
        });
        setIsSetAmountModalOpen(false);
        setIsSelectingProduct(false);
        return;
      }

      const formattedAmount = Number(
        formatAmount({ num: amount, to: 'point' })
      );
      if (Number.isNaN(formattedAmount)) {
        toast({
          status: 'error',
          title: 'Número inválido',
          duration: 2000,
          isClosable: true,
        });
        setIsSelectingProduct(false);
        return;
      }

      // TODO: verify if the amount informed of the product is available in stock of produt
      const { isInStock } = await ProductsService.verifyAmount({
        productId: productToSetAmount?._id as string,
        amount: formattedAmount,
      });

      if (!isInStock) {
        toast.closeAll();
        toast({
          status: 'error',
          title: 'Quantidade acima do estoque disponível',
          duration: 2000,
          isClosable: true,
        });
        setIsSelectingProduct(false);
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
      setIsAddingProducts(false);
      setIsSelectingProduct(false);
    } catch (error: any) {
      toast.closeAll();
      setIsAddingProducts(false);
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
      const { command } = await CommandsService.getOneCommand({ commandId });
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
          status: 'error',
          title: `O produto: ${hasSomeSelectedProductInCommand.name} já está na comanda`,
          duration: 2000,
          isClosable: true,
        });
        return;
      }

      const newProducts = [...command.products, ...selectedProducts];

      const { command: updatedCommand } = await CommandsService.updateCommand({
        _id: commandId,
        products: newProducts,
      });

      allCommandsDispatch({
        type: 'UPDATE-ONE-COMMAND',
        payload: { command: updatedCommand },
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

            if (stockUpdatedProduct) {
              stockProductsDispatch({
                type: 'UPDATE-ONE-PRODUCT',
                payload: { product: stockUpdatedProduct },
              });
            }
          })();
        }
      );

      // SOCKET.IO Broadcast to necessary entities the update of command

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
        duration: 3000,
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
    const filtered = allProducts?.filter(({ category }) => category === filter);
    return filtered;
  }, [filter, allProducts]);

  const filteredBySearch = useMemo(() => {
    const filtered = filteredByFilter.filter((product: any) => {
      const productObjStr = Object.values(product).join('').toLocaleLowerCase();
      if (productObjStr.includes(searchContent.toLowerCase())) {
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
