"use strict";
/*
                     ___
   ___  _______  ___/ (_)__ _
  / _ \/ __/ _ \/ _  / / _ `/
 / .__/_/  \___/\_,_/_/\_,_/
/_/

To ensure an optimal service
quality, we recommend you use
this library as-is. We cannot
guarantee a high quality
experience with a modified
client library.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProdia = exports.ProdiaBadResponseError = exports.ProdiaCapacityError = exports.ProdiaUserError = void 0;
const defaultJobOptions = {
    accept: undefined,
};
/* error types */
class ProdiaUserError extends Error {
}
exports.ProdiaUserError = ProdiaUserError;
class ProdiaCapacityError extends Error {
}
exports.ProdiaCapacityError = ProdiaCapacityError;
class ProdiaBadResponseError extends Error {
}
exports.ProdiaBadResponseError = ProdiaBadResponseError;
const createProdia = ({ token, baseUrl = "https://inference.prodia.com/v2", maxErrors = 1, maxRetries = Infinity, }) => {
    const job = async (params, _options) => {
        const options = {
            ...defaultJobOptions,
            ..._options,
        };
        let response;
        let errors = 0;
        let retries = 0;
        const formData = new FormData();
        // TODO: The input content-type is assumed here, but it shouldn't be.
        // Eventually we will support non-image inputs and we will need some way
        // to specify the content-type of the input.
        if (options.inputs !== undefined) {
            for (const input of options.inputs) {
                if (typeof File !== "undefined" && input instanceof File) {
                    formData.append("input", input, input.name);
                }
                if (input instanceof Blob) {
                    formData.append("input", input, "image.jpg");
                }
                if (input instanceof ArrayBuffer) {
                    formData.append("input", new Blob([input], {
                        type: "image/jpeg",
                    }), "image.jpg");
                }
            }
        }
        formData.append("job", new Blob([JSON.stringify(params)], {
            type: "application/json",
        }), "job.json");
        do {
            response = await fetch(`${baseUrl}/job`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: ["multipart/form-data", options.accept].filter(Boolean).join("; "),
                },
                body: formData,
            });
            // We bail from the loop if we get a 2xx response to avoid sleeping unnecessarily.
            if (response.status >= 200 && response.status < 300) {
                break;
            }
            if (response.status === 429) {
                retries += 1;
            }
            else if (response.status < 200 || response.status > 299) {
                errors += 1;
            }
            const retryAfter = Number(response.headers.get("Retry-After")) || 1;
            await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        } while (response.status !== 400 &&
            response.status !== 401 &&
            response.status !== 403 &&
            (response.status < 200 || response.status > 299) &&
            errors <= maxErrors &&
            retries <= maxRetries);
        if (response.status === 429) {
            throw new ProdiaCapacityError("Unable to schedule the job with current token.");
        }
        const body = await response.formData();
        const job = JSON.parse(new TextDecoder().decode(await body.get("job").arrayBuffer()));
        if ("error" in job && typeof job.error === "string") {
            throw new ProdiaUserError(job.error);
        }
        if (response.status < 200 || response.status > 299) {
            throw new ProdiaBadResponseError(`${response.status} ${response.statusText}`);
        }
        const buffer = await new Promise((resolve, reject) => {
            const output = body.get("output");
            const reader = new FileReader();
            reader.readAsArrayBuffer(output);
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Failed to read output"));
        });
        return {
            job: job,
            arrayBuffer: () => Promise.resolve(buffer),
        };
    };
    return {
        job,
    };
};
exports.createProdia = createProdia;
//# sourceMappingURL=index.js.map