/* eslint-disable react/destructuring-assignment */
import {
  Box,
  Divider,
  Flex,
  Stack,
  Text,
  Grid,
  Heading,
} from '@chakra-ui/react';
import { Header } from 'components/Header';
import { Layout } from 'components/Layout';
import { DateTime } from 'luxon';
import { Cashier } from 'types/Cashier';
import { formatDecimalNum } from 'utils/formatDecimalNum';

interface Props {
  cashier: Cashier;
  handleBackPage: () => void;
}

export const CashierLayout = ({ cashier, handleBackPage }: Props) => {
  const dt = DateTime.fromISO(cashier?.date).setLocale('pt-BR');

  return (
    <Layout>
      <Header hasBackPageBtn handleBackPage={handleBackPage} />
      <Flex justify="space-between">
        <Heading fontSize={[18, 22, 26]} color="blue.800" fontWeight={600}>
          Caixa do dia:{' '}
          <BoldText>{dt.toLocaleString(DateTime.DATE_FULL)}</BoldText>
        </Heading>
        <Box bg="blue.400" p={1} px={[2, 4]} rounded={4}>
          <Text fontSize={[20, 22]} color="blue.50">
            Total:{' '}
            <BoldText color="blue.50">
              R$
              {formatDecimalNum({
                num: cashier?.total?.toString(),
                to: 'comma',
              })}
            </BoldText>
          </Text>
        </Box>
      </Flex>

      <Stack gap={[4, 8]} mt={[6, 12]}>
        {cashier?.payments?.map(({ _id, totalPayed, paymentType, command }) => (
          <Flex
            key={`home-payments-${_id}`}
            bg="blue.50"
            p={[2, 4]}
            rounded={4}
            border="1px solid"
            borderColor="gray.200"
            color="blue.800"
            justify="center"
            align="flex-start"
            flexDirection="column"
            fontWeight={400}
            fontSize={[14, 16, 18]}
          >
            <Grid
              gridTemplateColumns={['1fr', '1fr 1fr']}
              w="100%"
              gap={[2, 4]}
            >
              <TextWhiteBox>
                <Text>
                  Total:{' '}
                  <BoldText>
                    R${' '}
                    {formatDecimalNum({
                      num: totalPayed.toString(),
                      to: 'comma',
                    })}
                  </BoldText>
                </Text>
              </TextWhiteBox>
              <TextWhiteBox>
                <Text>
                  Meio de Pagamento: <BoldText>{paymentType}</BoldText>
                </Text>
              </TextWhiteBox>
              <TextWhiteBox>
                <Text>
                  Mesa: <BoldText>{command.table}</BoldText>
                </Text>
              </TextWhiteBox>
              <TextWhiteBox>
                <Text>
                  Garçom: <BoldText>{command.waiter}</BoldText>
                </Text>
              </TextWhiteBox>
            </Grid>
            <Divider my={[3, 6]} bg="gray.200" />
            <Grid
              gridTemplateColumns={['1fr', '1fr 1fr', '1fr 1fr 1fr']}
              w="100%"
              gap={[2, 4]}
              fontSize={[14, 16]}
              color="blue.600"
              fontWeight={600}
              boxShadow="sm"
            >
              {command?.products?.map(({ _id: productId, name, amount }) => (
                <Box
                  key={`cashier-pay-${_id}-${productId}`}
                  bg="white"
                  p={2}
                  rounded={4}
                  textAlign="center"
                >
                  <Text>
                    {name} - {amount}
                  </Text>
                </Box>
              ))}
            </Grid>
          </Flex>
        ))}
      </Stack>
    </Layout>
  );
};

const BoldText = (props: any) => (
  <Box as="span" color="blue.800" fontWeight={700} {...props}>
    {props.children}
  </Box>
);

const TextWhiteBox = (props: any) => (
  <Box
    p={2}
    bg="blue.100"
    textAlign="center"
    border="1px solid"
    borderColor="gray.200"
    rounded={4}
    color="blue.900"
    fontWeight={600}
  >
    {props.children}
  </Box>
);
