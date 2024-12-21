"use strict";
/* Job Responses */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProdia = void 0;
const createProdia = ({ apiKey, base: _base, }) => {
    const base = _base || "https://api.prodia.com/v1";
    const headers = {
        "X-Prodia-Key": apiKey,
    };
    const generate = async (params) => {
        const response = await fetch(`${base}/sd/generate`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });
        if (response.status !== 200) {
            throw new Error(`Bad Prodia Response: ${response.status}`);
        }
        return (await response.json());
    };
    const transform = async (params) => {
        const response = await fetch(`${base}/sd/transform`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });
        if (response.status !== 200) {
            throw new Error(`Bad Prodia Response: ${response.status}`);
        }
        return (await response.json());
    };
    const controlnet = async (params) => {
        const response = await fetch(`${base}/sd/controlnet`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });
        if (response.status !== 200) {
            throw new Error(`Bad Prodia Response: ${response.status}`);
        }
        return (await response.json());
    };
    const inpainting = async (params) => {
        const response = await fetch(`${base}/sd/inpainting`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });
        if (response.status !== 200) {
            throw new Error(`Bad Prodia Response: ${response.status}`);
        }
        return (await response.json());
    };
    const xlGenerate = async (params) => {
        const response = await fetch(`${base}/sdxl/generate`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });
        if (response.status !== 200) {
            throw new Error(`Bad Prodia Response: ${response.status}`);
        }
        return (await response.json());
    };
    const getJob = async (jobId) => {
        const response = await fetch(`${base}/job/${jobId}`, {
            headers,
        });
        if (response.status !== 200) {
            throw new Error(`Bad Prodia Response: ${response.status}`);
        }
        return (await response.json());
    };
    const wait = async (job) => {
        let jobResult = job;
        while (jobResult.status !== "succeeded" &&
            jobResult.status !== "failed") {
            await new Promise((resolve) => setTimeout(resolve, 250));
            jobResult = await getJob(job.job);
        }
        return jobResult;
    };
    const listModels = async () => {
        const response = await fetch(`${base}/models/list`, {
            headers,
        });
        if (response.status !== 200) {
            throw new Error(`Bad Prodia Response: ${response.status}`);
        }
        return (await response.json());
    };
    return {
        generate,
        transform,
        controlnet,
        inpainting,
        xlGenerate,
        wait,
        getJob,
        listModels,
    };
};
exports.createProdia = createProdia;
//# sourceMappingURL=prodia.js.map