import type { Context } from '@deepseek-ai/cordis';
import type { IncomingMessage, ServerResponse } from 'node:http';
export declare const name = "genshin-bg";
export declare const inject: string[];
declare module '@deepseek-ai/cordis' {
    interface Context {
        webServer: {
            register(route: WebRoute | WebResourceRoute): () => void;
            registerUpgrade?(route: unknown): () => void;
            registerFallback?(route: unknown): () => void;
        };
    }
}
export interface WebRoute {
    kind: 'exact' | 'prefix';
    path: string;
    handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
}
export interface WebResourceRoute {
    kind: 'exact' | 'prefix';
    path: string;
    resource: (request: Request, peer?: unknown) => Promise<Response>;
}
export declare function apply(ctx: Context): void | (() => void);
