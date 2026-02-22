export declare class StellarService {
    private readonly logger;
    private server;
    constructor();
    createEscrow(buyerPublicKey: string, farmerPublicKey: string, amount: string): Promise<string>;
}
