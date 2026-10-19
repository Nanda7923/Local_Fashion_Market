export interface MMPayResult {
    success: boolean;
    orderId: string;
    cancelled?: boolean;
    expired?: boolean;
}

export interface MMPayConfig {
    merchantName?: string;
    design?: {
        mode?: "light" | "dark";
        color?: string;
    };
}

export interface MMPayInstance {
    pay: (orderId: string, callback: (result: MMPayResult) => void) => void;
}

declare global {
    interface Window {
        MMPaySDK?: new (
            publishableKey: string,
            config?: MMPayConfig
        ) => MMPayInstance;
    }
}