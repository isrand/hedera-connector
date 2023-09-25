import {ContractId, TransactionReceipt} from '@hashgraph/sdk';
import Long from 'long';

export interface IParsedTransactionReceipt {
  status: string;
  accountId: string | undefined;
  fileId: string | undefined;
  contractId: ContractId | undefined;
  topicId: string | undefined;
  tokenId: string | undefined;
  scheduleId: string | undefined;
  topicSequenceNumber: number | undefined;
  topicRunningHash: string | undefined;
  totalSupply: number | undefined;
  scheduledTransactionId: string | undefined;
  serials: Array<Long>;
  duplicates: ReadonlyArray<TransactionReceipt> | undefined;
  children: ReadonlyArray<TransactionReceipt> | undefined;
}
