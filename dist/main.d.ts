declare class HtmlCompoFunc {
    private readonly no_parameter;
    private mainNode;
    private validNode;
    private node;
    constructor(node: HTMLElement);
    html(): string;
    html(cont: string): void;
    attr(name: string): string | null;
    attr(name: string, value: string): void;
}
interface HtmlCompoAPI {
    getComponent(reference: string): HtmlCompoFunc | null;
}
declare global {
    interface Window {
        htmlCompo: HtmlCompoAPI;
    }
}
export {};
//# sourceMappingURL=main.d.ts.map