import {IHederaTransactionResponse} from './interfaces/IHederaTransactionResponse';
import {IHederaConnectorResponse} from '../../api/responses/IHederaConnectorResponse';
import {
  TransactionReceipt,
  TransactionRecord,
  TransactionResponse,
  TransactionResponseJSON,
  Transfer
} from '@hashgraph/sdk';
import * as Long from 'long';
import {IParsedTransactionReceipt} from './interfaces/IParsedTransactionReceipt';
import {IParsedTransactionRecord} from './interfaces/IParsedTransactionRecord';

export class HederaTransactionResponse {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly hederaTransactionResponse: Readonly<IHederaTransactionResponse>) { }

  public parse(): IHederaConnectorResponse {
    return {
      response: this.parseTransactionResponse(this.hederaTransactionResponse.response),
      receipt: this.parseTransactionReceipt(this.hederaTransactionResponse.receipt),
      record: this.parseTransactionRecord(this.hederaTransactionResponse.record)
    };
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  private parseTransactionResponse(response: TransactionResponse): TransactionResponseJSON {
    return response.toJSON();
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  private parseTransactionReceipt(receipt: TransactionReceipt): IParsedTransactionReceipt {
    return {
      status: receipt.status.toString(),
      accountId: receipt.accountId ? receipt.accountId.toString() : undefined,
      fileId: receipt.fileId ? receipt.fileId.toString() : undefined,
      contractId: receipt.contractId ? receipt.contractId : undefined,
      topicId: receipt.topicId ? receipt.topicId.toString() : undefined,
      tokenId: receipt.tokenId ? receipt.tokenId.toString() : undefined,
      scheduleId: receipt.scheduleId ? receipt.scheduleId.toString() : undefined,
      // exchangeRate: receipt.exchangeRate || undefined,           // exchangeRate is a Hedera internal variable to keep track of how much tx's cost.
      topicSequenceNumber: receipt.topicSequenceNumber ? this.parseLongLong(Long.fromNumber(Number(receipt.topicSequenceNumber))) : undefined,
      topicRunningHash: receipt.topicRunningHash ? this.parseUint8Array(receipt.topicRunningHash) : undefined,
      totalSupply: this.parseLongLong(Long.fromNumber(Number(receipt.totalSupply))),
      scheduledTransactionId: receipt.scheduledTransactionId ? receipt.scheduledTransactionId.toString() : undefined,
      serials: this.parseArray(receipt.serials),
      duplicates: this.parseArray(receipt.duplicates),
      children: this.parseArray(receipt.children)
    };
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  private parseTransactionRecord(record: TransactionRecord): IParsedTransactionRecord {
    return {
      aliasKey: record.aliasKey ? record.aliasKey.toStringRaw() : undefined,
      assessedCustomFees: this.parseArray(record.assessedCustomFees),
      automaticTokenAssociations: this.parseArray(record.automaticTokenAssociations),
      consensusTimestamp: record.consensusTimestamp,
      contractFunctionResult: record.contractFunctionResult ? record.contractFunctionResult : undefined,
      ethereumHash: record.ethereumHash ? record.ethereumHash.toString() : undefined,
      evmAddress: record.evmAddress ? record.evmAddress.toBytes().toString() : undefined,
      nftTransfers: this.parseMapString(record.nftTransfers.toString()),
      paidStakingRewards: this.parseArray(record.paidStakingRewards),
      parentConsensusTimestamp: record.parentConsensusTimestamp ? record.parentConsensusTimestamp : undefined,
      prngBytes: record.prngBytes ? this.parseUint8Array(record.prngBytes) : undefined,
      prngNumber: record.prngNumber || undefined,
      scheduleRef: record.scheduleRef ? record.scheduleRef.toString() : undefined,
      tokenTransfers: this.parseMapString(record.tokenTransfers.toString()),
      tokenTransfersList: this.parseArray(record.tokenTransfersList),
      transactionFee: record.transactionFee,
      transactionMemo: record.transactionMemo.toString() || undefined,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      transfers: record.transfers.map((elem: Transfer) => new Transfer({accountId: elem.accountId.toString(), amount: elem.amount, isApproved: elem.isApproved}))
    };
  }

  private parseMapString<T>(mapString: string | undefined): T | undefined {
    if (!mapString || mapString === '{}') {
      return undefined;
    }

    return JSON.parse(mapString) as T;
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  private parseLongLong(longLong: Long.Long): number | undefined {
    if (longLong.low !== 0 || longLong.high !== 0) {
      return longLong.toNumber();
    }

    return undefined;
  }

  private parseUint8Array(array: Readonly<Uint8Array>): string | undefined {
    if (array.buffer.byteLength === 0) {
      return undefined;
    }

    return Buffer.from(array.buffer).toString();
  }

  private parseArray<T>(array: ReadonlyArray<T>): ReadonlyArray<T> | undefined {
    if (array.length === 0) {
      return undefined;
    }

    return array;
  }
}
