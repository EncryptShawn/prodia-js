export type ProdiaJobBase = {
    job: string;
};
export type ProdiaJobQueued = ProdiaJobBase & {
    imageUrl: undefined;
    status: "queued";
};
export type ProdiaJobGenerating = ProdiaJobBase & {
    imageUrl: undefined;
    status: "generating";
};
export type ProdiaJobFailed = ProdiaJobBase & {
    imageUrl: undefined;
    status: "failed";
};
export type ProdiaJobSucceeded = ProdiaJobBase & {
    imageUrl: string;
    status: "succeeded";
};
export type ProdiaJob = ProdiaJobQueued | ProdiaJobGenerating | ProdiaJobFailed | ProdiaJobSucceeded;
export type ProdiaGenerateRequest = {
    prompt: string;
    model?: string;
    negative_prompt?: string;
    steps?: number;
    cfg_scale?: number;
    seed?: number;
    upscale?: boolean;
    sampler?: string;
    aspect_ratio?: "square" | "portrait" | "landscape";
};
type ImageInput = {
    imageUrl: string;
} | {
    imageData: string;
};
export type ProdiaTransformRequest = ImageInput & {
    prompt: string;
    model?: string;
    denoising_strength?: number;
    negative_prompt?: string;
    steps?: number;
    cfg_scale?: number;
    seed?: number;
    upscale?: boolean;
    sampler?: string;
};
export type ProdiaControlnetRequest = ImageInput & {
    controlnet_model: string;
    controlnet_module?: string;
    threshold_a?: number;
    threshold_b?: number;
    resize_mode?: number;
    prompt: string;
    negative_prompt?: string;
    steps?: number;
    cfg_scale?: number;
    seed?: number;
    upscale?: boolean;
    sampler?: string;
    width?: number;
    height?: number;
};
type MaskInput = {
    maskUrl: string;
} | {
    maskData: string;
};
export type ProdiaInpaintingRequest = ImageInput & MaskInput & {
    prompt: string;
    model?: string;
    denoising_strength?: number;
    negative_prompt?: string;
    steps?: number;
    cfg_scale?: number;
    seed?: number;
    upscale?: boolean;
    mask_blur: number;
    inpainting_fill: number;
    inpainting_mask_invert: number;
    inpainting_full_res: string;
    sampler?: string;
};
export type ProdiaXlGenerateRequest = {
    prompt: string;
    model?: string;
    negative_prompt?: string;
    steps?: number;
    cfg_scale?: number;
    seed?: number;
    upscale?: boolean;
    sampler?: string;
};
export type Prodia = {
    generate: (params: ProdiaGenerateRequest) => Promise<ProdiaJobQueued>;
    transform: (params: ProdiaTransformRequest) => Promise<ProdiaJobQueued>;
    controlnet: (params: ProdiaControlnetRequest) => Promise<ProdiaJobQueued>;
    inpainting: (params: ProdiaInpaintingRequest) => Promise<ProdiaJobQueued>;
    xlGenerate: (params: ProdiaXlGenerateRequest) => Promise<ProdiaJobQueued>;
    getJob: (jobId: string) => Promise<ProdiaJob>;
    wait: (params: ProdiaJob) => Promise<ProdiaJobSucceeded | ProdiaJobFailed>;
    listModels: () => Promise<string[]>;
};
export type CreateProdiaOptions = {
    apiKey: string;
    base?: string;
};
export declare const createProdia: ({ apiKey, base: _base, }: CreateProdiaOptions) => Prodia;
export {};
