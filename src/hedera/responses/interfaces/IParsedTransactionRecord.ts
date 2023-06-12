import {AssessedCustomFee, ContractFunctionResult, Hbar, Timestamp, Transfer} from '@hashgraph/sdk';
import TokenAssociation from '@hashgraph/sdk/lib/token/TokenAssociation';
import TokenNftTransferMap from '@hashgraph/sdk/lib/account/TokenNftTransferMap';
import TokenTransfer from '@hashgraph/sdk/lib/token/TokenTransfer';
import TokenTransferMap from '@hashgraph/sdk/lib/account/TokenTransferMap';

export interface IParsedTransactionRecord {
  aliasKey: string | undefined;
  assessedCustomFees: ReadonlyArray<AssessedCustomFee> | undefined;
  automaticTokenAssociations: ReadonlyArray<TokenAssociation> | undefined;
  consensusTimestamp: Readonly<Timestamp>;
  contractFunctionResult: Readonly<ContractFunctionResult> | undefined;
  ethereumHash: string | undefined;
  evmAddress: string | undefined;
  nftTransfers: Readonly<TokenNftTransferMap> | undefined;
  paidStakingRewards: ReadonlyArray<Transfer> | undefined;
  parentConsensusTimestamp: Readonly<Timestamp> | undefined;
  prngBytes: string | undefined;
  prngNumber: number | undefined;
  scheduleRef: string | undefined;
  tokenTransfers: Readonly<TokenTransferMap> | undefined;
  tokenTransfersList: ReadonlyArray<TokenTransfer> | undefined;
  transactionFee: Hbar;
  transactionMemo: string | undefined;
  transfers: ReadonlyArray<Transfer>;
}
