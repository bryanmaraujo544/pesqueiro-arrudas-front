import { serverApi } from 'services/serverApi';
import { Command } from 'types/Command';
import { Product } from 'types/Product';

interface UpdateCommand extends Command {
  _id: string | undefined;
  products?: Product[] | undefined;
  updateTotal?: string;
  total?: number;
}

interface DeleteCommand {
  commandId: string;
}

class CommandService {
  async getOneCommand({
    commandId,
  }: {
    commandId: string | string[] | undefined;
  }) {
    const { data } = await serverApi.get(`/commands/${commandId}`);
    return data;
  }

  async updateCommand({
    _id,
    waiter,
    table,
    fishingType,
    products,
    total,
    isActive,
    updateTotal,
  }: UpdateCommand) {
    const { data } = await serverApi.put(
      `/commands/${_id}?updateTotal=${updateTotal}`,
      {
        waiter,
        table,
        fishingType,
        products,
        total,
        isActive,
      }
    );
    return data;
  }

  async deleteCommand({ commandId }: DeleteCommand) {
    const { data } = await serverApi.delete(`/commands/${commandId}`);
    return data;
  }
}

export default new CommandService();
