import {TransactionReceipt, TransactionRecord, TransactionResponse} from '@hashgraph/sdk';

export interface IHederaTransactionResponse {
  response: Readonly<TransactionResponse>;
  receipt: Readonly<TransactionReceipt>;
  record: Readonly<TransactionRecord>;
  isMock: Readonly<boolean>;
}
