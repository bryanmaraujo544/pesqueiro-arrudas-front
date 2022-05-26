/* eslint-disable react/no-children-prop */
import {
  InputGroup,
  InputLeftElement,
  Stack,
  Icon,
  Input,
  Grid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  Text,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Th,
  Tr,
  Td,
} from '@chakra-ui/react';
import { BiSearchAlt } from 'react-icons/bi';

import { Modal } from 'components/Modal';

const filterOptions = [
  'Pesca',
  'Peixes',
  'Pratos',
  'Bebidas',
  'Doses',
  'Sobremesas',
  'Porções',
  'Misturas Congeladas',
];

const productsColumns = ['Nome', 'Quantidade', 'Preço Unid.'];

type Props = {
  isModalOpen: boolean;
  handleCloseModal: () => void;
  products: any[];
  selectedProducts: any[];
  handleOpenAmountModal: any;
};

export const AddProductModalLayout = ({
  isModalOpen,
  handleCloseModal,
  products,
  selectedProducts,
  handleOpenAmountModal,
}: Props) => (
  <Modal
    isOpen={isModalOpen}
    onClose={() => handleCloseModal()}
    title="Adicionar Produto"
    size="6xl"
  >
    <Stack spacing={2}>
      {/* Header */}
      <Grid gridTemplateColumns={['1fr', '1fr 2fr']} gap={[2, 4]}>
        <Menu>
          <MenuButton as={Button}>Filtrar</MenuButton>
          <MenuList overflow="scroll">
            {filterOptions.map((filterText) => (
              <MenuItem key={`add-product-filter-${filterText}`}>
                {filterText}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            children={<Icon as={BiSearchAlt} />}
          />
          <Input placeholder="Pesquise por algum produto" />
        </InputGroup>
      </Grid>

      {/* Products selected */}
      <Grid gridTemplateColumns="repeat(2, 1fr)">
        {selectedProducts.map(({ id, name, amount }) => (
          <Flex key={`selected-product-${id}`}>
            <Text>{name}</Text>
            <Text>{amount}</Text>
          </Flex>
        ))}
      </Grid>

      {/* List of products to add in command */}
      <TableContainer>
        <Table w="100%" mt={[2, 4]}>
          <Thead>
            <Tr>
              {productsColumns.map((column) => (
                <Th key={`add-product-table-header-${column}`}>{column}</Th>
              ))}
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {products?.map(({ id, name, unitPrice, amount }) => (
              <Tr key={`add-product-modal-product-${id}`}>
                <Td>{name}</Td>
                <Td>{amount}</Td>
                <Td>{unitPrice}</Td>
                <Td isNumeric>
                  <Button
                    colorScheme="blue"
                    bg="blue.400"
                    onClick={
                      () =>
                        handleOpenAmountModal({
                          product: { id, name, unitPrice },
                        })
                      // handleAddProduct({ id, name, unitPrice, amount })
                    }
                  >
                    Adicionar
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
    <Button colorScheme="red" onClick={() => handleCloseModal()}>
      Cancelar
    </Button>

    {/* <h1>Add Product</h1> */}
  </Modal>
);
