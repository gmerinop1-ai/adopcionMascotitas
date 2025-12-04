declare module 'culqi-node' {
  export default class Culqi {
    constructor(options: { privateKey: string });
    charges: {
      create(data: any): Promise<any>;
      get(id: string): Promise<any>;
    };
    tokens: {
      create(data: any): Promise<any>;
    };
    customers: {
      create(data: any): Promise<any>;
    };
  }
}