import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';

import { CommandContext } from 'pages-components/Command';
import { formatDecimalNum } from 'utils/formatDecimalNum';
import { useToast } from '@chakra-ui/react';
// import PaymentsService from 'pages-components/Command/services/PaymentsService';
import CommandService from 'pages-components/Command/services/CommandService';
import { PaymentModalLayout } from './layout';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const PaymentModal = ({ isModalOpen, setIsModalOpen }: Props) => {
  const { command, setCommand } = useContext(CommandContext);
  const [receivedValue, setReceivedValue] = useState('');
  const [exchange, setExchange] = useState('0');
  const [isReceivedValueInvalid, setIsReceivedValueInvalid] = useState({
    value: false,
    message: '',
  });
  const [paymentType, setPaymentType] = useState('Dinheiro');

  const [isPaying, setIsPaying] = useState(false);

  const toast = useToast();

  const tempTotalToBePayed =
    Math.round(
      ((command?.total || 0) - (command?.totalPayed || 0) + Number.EPSILON) *
        100
    ) / 100;
  const totalToBePayed = tempTotalToBePayed > 0 ? tempTotalToBePayed : 0;

  useEffect(() => {
    const receivedValueFormatted = Number(
      formatDecimalNum({ num: receivedValue, to: 'point' })
    );

    if (Number.isNaN(receivedValueFormatted)) {
      setIsReceivedValueInvalid({ value: true, message: 'Valor inválido.' });
      setExchange('');
      return;
    }

    if (receivedValue === '') {
      setExchange('0');
    }

    if (receivedValueFormatted > totalToBePayed && paymentType === 'Dinheiro') {
      setIsReceivedValueInvalid({ value: false, message: '' });
      const updatedExchange = (receivedValueFormatted - totalToBePayed).toFixed(
        2
      );
      setExchange(
        formatDecimalNum({
          num: updatedExchange.toString(),
          to: 'comma',
        })
      );
    }

    if (paymentType !== 'Dinheiro' && receivedValueFormatted > totalToBePayed) {
      setIsReceivedValueInvalid({
        value: true,
        message: 'Pagamento maior do que o necessário',
      });
    } else {
      setIsReceivedValueInvalid({ value: false, message: '' });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receivedValue]);

  function handleCloseModal() {
    setIsModalOpen(false);
    setIsReceivedValueInvalid({ value: false, message: '' });
    setIsPaying(false);
    setReceivedValue('');
    setExchange('0');
  }

  const handleMakePayment = async (e: any) => {
    try {
      e.preventDefault();

      if (isPaying) {
        return;
      }

      setIsPaying(true);
      if (totalToBePayed === 0) {
        toast({
          status: 'info',
          title: 'Não há nada a se pagar',
          duration: 1000,
        });

        setIsPaying(false);
        return;
      }

      if (!receivedValue) {
        setIsPaying(false);
        toast.closeAll();
        toast({
          status: 'warning',
          title: 'Insira o valor recebido do cliente',
          duration: 2000,
        });
        return;
      }

      if (isReceivedValueInvalid.value === true) {
        setIsPaying(false);
        toast.closeAll();
        toast({
          status: 'warning',
          title: 'Valor recebido inválido!',
          duration: 1000,
        });
        return;
      }

      const receivedValueFormatted = Number(
        formatDecimalNum({ num: receivedValue, to: 'point' })
      );

      const totalToPay =
        receivedValueFormatted > totalToBePayed
          ? totalToBePayed
          : receivedValueFormatted;

      const { message, command: updatedCommand } =
        await CommandService.updateCommand({
          _id: command._id,
          updateTotal: 'true',
          total: totalToPay,
          paymentType,
        });

      setCommand(updatedCommand);

      toast({
        status: 'success',
        title: message,
        isClosable: true,
        duration: 3000,
      });

      handleCloseModal();
    } catch (error: any) {
      setIsPaying(false);
      toast.closeAll();
      toast({
        status: 'error',
        title:
          error?.response?.data?.message ||
          'Erro no servidor. Recarregue a página.',
        duration: 2000,
      });
    }
  };

  return (
    <PaymentModalLayout
      isModalOpen={isModalOpen}
      handleCloseModal={handleCloseModal}
      handleMakePayment={handleMakePayment}
      command={command}
      exchange={exchange}
      paymentType={paymentType}
      setPaymentType={setPaymentType}
      receivedValue={receivedValue}
      setReceivedValue={setReceivedValue}
      isReceivedValueInvalid={isReceivedValueInvalid}
      totalToBePayed={totalToBePayed}
      isPaying={isPaying}
    />
  );
};
