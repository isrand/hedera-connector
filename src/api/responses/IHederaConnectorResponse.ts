export interface IHederaConnectorResponse {
  statusCode: number;
  payload: unknown;
  message?: string;
  error?: string;
}
