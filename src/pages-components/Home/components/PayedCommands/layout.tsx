/* eslint-disable react/destructuring-assignment */
import {
  Heading,
  Select,
  Stack,
  Flex,
  Text,
  Box,
  Grid,
  Divider,
  Button,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { Payment } from 'pages-components/Home/types/Payment';
import { formatDecimalNum } from 'utils/formatDecimalNum';
import { get10PastDays } from 'utils/get10PastDays';

import { BsCashStack } from 'react-icons/bs';

interface Props {
  payedCommandsDate: any;
  setPayedCommandsDate: any;
  payments: Payment[];
  handleGoToCommandPage: (commandId: string) => void;
  handleCloseCashier: () => void;
  isGettingPayments: boolean;
}

export const PayedCommandsLayout = ({
  payedCommandsDate,
  setPayedCommandsDate,
  payments,
  handleGoToCommandPage,
  handleCloseCashier,
  isGettingPayments,
}: Props) => {
  const past10Days = get10PastDays();

  return (
    <Stack gap={[4, 8]}>
      <Flex justifyContent="space-between">
        <Heading as="h2" fontSize={[20, 24]} color="blue.900" flex="1">
          Comandas Pagas
        </Heading>
        <Flex align="center" gap={[4, 6]}>
          <Select
            onChange={(e) => setPayedCommandsDate(e.target.value)}
            w="auto"
            value={payedCommandsDate}
          >
            {past10Days.map(({ formatted }) => (
              <option key={`10-days-${formatted}`}>{formatted}</option>
            ))}
          </Select>
          <Button
            onClick={() => handleCloseCashier()}
            colorScheme="blue"
            display="flex"
            alignItems="center"
            gap={[2, 3]}
          >
            Fechar Caixa
            <Icon as={BsCashStack} mt={0.4} />
          </Button>
        </Flex>
      </Flex>

      <Grid gridTemplateColumns={['1fr', '1fr', '1fr 1fr']} gap={[2, 4]}>
        {isGettingPayments ? (
          <Spinner size="xl" />
        ) : (
          payments?.map(
            ({
              _id,
              totalPayed,
              paymentType,
              createdAt,
              command,
              waiterExtra,
            }) => (
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
                <Text>
                  Mesa: <BoldText>{command?.table}</BoldText>
                </Text>
                <Text>
                  Total:{' '}
                  <BoldText>
                    R${' '}
                    {formatDecimalNum({
                      num: totalPayed?.toString(),
                      to: 'comma',
                    })}
                  </BoldText>
                </Text>
                <Text>
                  Meio de Pagamento: <BoldText>{paymentType}</BoldText>
                </Text>
                <Text>
                  Criada em:{' '}
                  <BoldText>
                    {DateTime.fromISO(createdAt, {
                      zone: 'pt-BR',
                      setZone: true,
                    })
                      .setLocale('pt-BR')
                      .toLocaleString(DateTime.DATETIME_MED)}
                  </BoldText>
                </Text>
                <Text>
                  Caixinha {command?.waiter}:{' '}
                  <BoldText>
                    R${' '}
                    {formatDecimalNum({
                      num:
                        (waiterExtra?.toString() as string) || ('0' as string),
                      to: 'comma',
                    })}
                  </BoldText>
                </Text>
                <Divider my={2} />
                <Stack
                  gap={[1, 2]}
                  w="100%"
                  align="flex-start"
                  fontSize={[14, 16]}
                  color="blue.600"
                  fontWeight={600}
                >
                  <Stack>
                    {(command?.products?.length as any) > 3
                      ? command?.products
                          ?.slice(0, 3)
                          ?.map(({ _id: productId, name, amount }) => (
                            <Box key={`pay-${_id}-${productId}`}>
                              <Text>
                                {name} - {amount}
                              </Text>
                            </Box>
                          ))
                      : command?.products?.map(
                          ({ _id: productId, name, amount }) => (
                            <Box key={`pay-${_id}-${productId}`}>
                              <Text>
                                {name} - {amount}
                              </Text>
                            </Box>
                          )
                        )}
                    {(command?.products?.length as any) > 3 && (
                      <BoldText>...</BoldText>
                    )}
                  </Stack>
                  <Button
                    onClick={() =>
                      handleGoToCommandPage(command?._id as string)
                    }
                    colorScheme="blue"
                    fontSize={[14, 16]}
                    h="auto"
                    py={2}
                    alignSelf="flex-end"
                    bg="none"
                    color="blue.500"
                    border="2px solid"
                    borderColor="blue.500"
                    _hover={{
                      bg: 'blue.500',
                      color: 'white',
                    }}
                  >
                    Ver comanda
                  </Button>
                </Stack>
              </Flex>
            )
          )
        )}
      </Grid>
    </Stack>
  );
};

const BoldText = (props: any) => (
  <Box as="span" color="blue.600" fontWeight={700} {...props}>
    {props.children}
  </Box>
);
