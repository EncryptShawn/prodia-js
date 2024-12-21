type JsonObject = {
    [Key in string]: JsonValue;
} & {
    [Key in string]?: JsonValue | undefined;
};
type JsonArray = JsonValue[] | readonly JsonValue[];
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type ProdiaJob = Record<string, JsonValue>;
export type ProdiaJobOptions = {
    accept?: "application/json" | "image/jpeg" | "image/png" | "image/webp" | "multipart/form-data" | "video/mp4";
    inputs?: (File | Blob | ArrayBuffer)[];
};
export type ProdiaJobResponse = {
    job: ProdiaJob;
    arrayBuffer: () => Promise<ArrayBuffer>;
};
export type Prodia = {
    job: (params: ProdiaJob, options?: Partial<ProdiaJobOptions>) => Promise<ProdiaJobResponse>;
};
export type CreateProdiaOptions = {
    token: string;
    baseUrl?: string;
    maxErrors?: number;
    maxRetries?: number;
};
export declare class ProdiaUserError extends Error {
}
export declare class ProdiaCapacityError extends Error {
}
export declare class ProdiaBadResponseError extends Error {
}
export declare const createProdia: ({ token, baseUrl, maxErrors, maxRetries, }: CreateProdiaOptions) => Prodia;
export {};
