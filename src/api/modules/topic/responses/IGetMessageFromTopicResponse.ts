import {Timestamp} from '@hashgraph/sdk';

export interface IGetMessageFromTopicResponse {
  consensusTimestamp: Timestamp;
  sequenceNumber: number;
  contents: Uint8Array;
}
