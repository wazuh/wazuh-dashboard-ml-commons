import { AxiosError } from 'axios';
import { HttpClient } from '../../../../common/http/domain/entities/http-client';
import { AssistantRepository } from '../../../application/ports/assistant-repository';

export class AssistantOpenSearchRepository implements AssistantRepository {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly proxyHttpClient: HttpClient,
  ) {}

  public async getConfig(): Promise<any> {
    try {
      const response = await this.proxyHttpClient.get(
        '/.plugins-ml-config/_doc/os_chat',
      );
      return response;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.status === 403) {
          throw new Error(
            `You don’t have the necessary permissions to access this resource.`,
          );
        }
      }
      // If this endpoint returns a 404, it does not mean that the endpoint or
      // the route was not found, but rather that there is no agent registered
      // yet. It may be because it was never registered and this is the first
      // time, or because it was deleted. It existed and was deleted.
      return {};
    }
  }
}
