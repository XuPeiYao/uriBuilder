import { IUriQueryModel, UriQueryBuilder } from './uriQueryBuilder';
import { UriSchemaPortList } from './uriSchemaPortList';

// #region Uri Format Regex
const uriRegExp = /^(([^:/?#]+):)\/\/([^/?#]+)(\?([^#]*))?(#(.*))?/;
const uriRegExp_schema = /^(([^:/?#]+):)/;
const uriRegExp_hostPort = /\/\/[^/?#]+/;
const uriRegExp_pathSegments = /(\/[^/?#]*)+/;
const uriRegExp_query = /\?[^#]*/;
const uriRegExp_hash = /#(.*)/;
// #endregion

export interface IUriModel {
  schema: string;
  host: string;
  port: number;
  pathSegments: string[];
  query: IUriQueryModel;
  hash: string;
}

export class UriBuilder implements IUriModel {
  public schema: string;
  public host: string;

  // #region Port
  private _port?: number;
  public get port(): number {
    return this._port || UriSchemaPortList.getPort(this.schema);
  }
  public set port(value: number) {
    this._port = value;
  }
  // #endregion

  public pathSegments: string[];

  public query: IUriQueryModel;
  public hash: string;

  public static isUriFormat(str: string): boolean {
    return uriRegExp.test(str);
  }

  public static parse(uri: string): UriBuilder {
    if (!this.isUriFormat(uri)) {
      throw new Error('URI Format ERROR');
    }

    const result = new UriBuilder();

    result.schema = uri.match(uriRegExp_schema)[0];
    result.schema = result.schema.substring(0, result.schema.length - 1);

    result.host = uri.match(uriRegExp_hostPort)[0].substring(2);
    const hostPortTemp = result.host.split(':', 2);
    result.host = hostPortTemp[0];
    result.port = +hostPortTemp[1];

    const queryTemp = uri.match(uriRegExp_query);
    if (queryTemp) {
      result.query = UriQueryBuilder.parse(queryTemp[0]).model;
    }

    const hashTemp = uri.match(uriRegExp_hash);
    if (hashTemp) {
      result.hash = hashTemp[0];
    }

    return result;
  }
}
