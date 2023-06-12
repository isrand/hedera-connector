import {ICredentials} from './ICredentials';

export interface IWallet {
  initialize: () => void;
  loadCredentials: (accountId?: string) => ICredentials;
}
