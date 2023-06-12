/*
 * The IEncryptedConfigurationMessage interface holds the information about an encrypted topic's
 * encrypted configuration message. Key names are just simple letters because space is a premium
 * when creating transactions on the Hedera network.
 */

/*
 * You can think of the configuration message as a genesis block in Hyperledger Fabric, containing
 * information about "who" participates in the topic, as well as their keys for encryption.
 */

import {IEncryptedObject} from './IEncryptedObject';

export interface IEncryptedTopicConfiguration extends IEncryptedObject {

  /*
   * The field "d" is an array containing the encrypted submit keys.
   * Submit keys MUST be used to sign a topic message send transaction.
   * The submit keys are also encrypted with each participant's public key,
   * giving the participants implicit access to the topic.
   */
  // eslint-disable-next-line id-blacklist
  d: Array<string>;
}
