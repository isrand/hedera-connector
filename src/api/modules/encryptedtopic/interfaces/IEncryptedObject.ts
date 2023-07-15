export interface IEncryptedObject {

  /*
   * The field "a" is the encrypted payloads.
   * This message is encrypted using symmetric keys.
   */
  a: Array<string>;

  /*
   * The field "b" is an array containing the encapsulated symmetric keys.
   * The end user can extract their symmetric key by performing a Kyber decryption
   * pass.
   */
  b: Array<string>;

  /*
   * The field "h" contains a hash of the contents of the message.
   * This field is used to verify the integrity of the data upon decryption,
   * as Kyber decryption does not throw an error if incorrect set of symmetric key + initvector
   * is used. Instead it returns a wrong payload.
   */
  h: string;
}
