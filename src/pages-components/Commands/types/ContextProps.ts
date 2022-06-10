import { Dispatch, SetStateAction } from 'react';
import { Command } from 'types/Command';

interface AllCommandsAction {
  type:
    | 'ADD-ALL-COMMANDS'
    | 'ADD-ONE-COMMAND'
    | 'REMOVE-ONE-COMMAND'
    | 'UPDATE-ONE-COMMAND';
  payload: any;
}

export type ContextProps = {
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
  orderBy: string;
  setOrderBy: Dispatch<SetStateAction<string>>;
  orderByDir: 'asc' | 'desc';
  setOrderByDir: Dispatch<SetStateAction<'asc' | 'desc'>>;
  searchContent: string;
  setSearchContent: Dispatch<SetStateAction<string>>;
  allCommands: Command[];
  allCommandsDispatch: Dispatch<AllCommandsAction>;
  commandStatusFilter: 'Ativas' | 'Pagas';
  setCommandStatusFilter: Dispatch<SetStateAction<'Ativas' | 'Pagas'>>;
};
