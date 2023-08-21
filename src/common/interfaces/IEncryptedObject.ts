import {IEncryptedObjectHashMap} from './IEncryptedObjectHashMap';
import {KeySize} from '../../crypto/enums/KeySize';

export interface IEncryptedObject {

  /*
   * The field "a" is the hash map containing encrypted payloads.
   */
  a: IEncryptedObjectHashMap;

  /*
   * The field "b" is an object containing the encapsulated symmetric keys.
   * The end user can extract their symmetric key by performing a Kyber decryption
   * pass.
   */
  b: IEncryptedObjectHashMap;

  /*
   * The field "h" contains a hash of the contents of the payload.
   * This field is used to verify the integrity of the data upon decryption,
   * as Kyber decryption does not throw an error if incorrect set of symmetric key + initvector
   * is used. Instead, it returns a wrong payload.
   */
  h: string;

  /*
   * The field "s" indicates the size of the Kyber key used for encryption- 512, 768 or 1024
   */
  s: KeySize;
}
