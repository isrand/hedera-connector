import {Account} from '../support/Account';

export interface IWallet {
  initializeNodeAccount: () => Promise<Account>;
  loadAccount: (accountId: string) => Promise<Account>;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  storeAccount: (account: Account) => Promise<void>;

  loadAllAccounts: () => Promise<Array<Account>>;
}
