import { Buffer } from 'buffer';

type JsonObject =
	& { [Key in string]: JsonValue }
	& {
		[Key in string]?: JsonValue | undefined;
	};
type JsonArray = JsonValue[] | readonly JsonValue[];
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type ProdiaJob = Record<string, JsonValue>;

export type ProdiaJobOptions = {
	accept?:
		| "application/json"
		| "image/jpeg"
		| "image/png"
		| "image/webp"
		| "multipart/form-data"
		| "video/mp4";
	inputs?: (Buffer | ArrayBuffer)[];
};

const defaultJobOptions: ProdiaJobOptions = {
	accept: undefined,
};

export type ProdiaJobResponse = {
	job: ProdiaJob;
	arrayBuffer: () => Promise<ArrayBuffer>;
};

export type Prodia = {
	job: (
		params: ProdiaJob,
		options?: Partial<ProdiaJobOptions>,
	) => Promise<ProdiaJobResponse>;
};

export type CreateProdiaOptions = {
	token: string;
	baseUrl?: string;
	maxErrors?: number;
	maxRetries?: number;
};

export class ProdiaUserError extends Error {}
export class ProdiaCapacityError extends Error {}
export class ProdiaBadResponseError extends Error {}

export const createProdia = ({
	token,
	baseUrl = "https://inference.prodia.com/v2",
	maxErrors = 1,
	maxRetries = Infinity,
}: CreateProdiaOptions): Prodia => {
	const job = async (
		params: ProdiaJob,
		_options?: Partial<ProdiaJobOptions>,
	) => {
		const options = {
			...defaultJobOptions,
			..._options,
		};

		let response: Response;

		let errors = 0;
		let retries = 0;

		const formData = new FormData();

		if (options.inputs !== undefined) {
			for (const input of options.inputs) {
				if (Buffer.isBuffer(input)) {
					formData.append("input", new Blob([input]), "image.jpg");
				} else if (input instanceof ArrayBuffer) {
					const buffer = Buffer.from(input);
					formData.append("input", new Blob([buffer]), "image.jpg");
				}
			}
		}

		formData.append(
			"job",
			new Blob([JSON.stringify(params)], { type: "application/json" }),
		);

		do {
			response = await fetch(`${baseUrl}/job`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: ["multipart/form-data", options.accept].filter(Boolean).join("; "),
				},
				body: formData,
			});

			if (response.status >= 200 && response.status < 300) {
				break;
			}

			if (response.status === 429) {
				retries += 1;
			} else if (response.status < 200 || response.status > 299) {
				errors += 1;
			}

			const retryAfter = Number(response.headers.get("Retry-After")) || 1;
			await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
		} while (
			response.status !== 400 &&
			response.status !== 401 &&
			response.status !== 403 &&
			(response.status < 200 || response.status > 299) &&
			errors <= maxErrors &&
			retries <= maxRetries
		);

		if (response.status === 429) {
			throw new ProdiaCapacityError(
				"Unable to schedule the job with current token.",
			);
		}

		const body = await response.json();
		const job = body.job as ProdiaJob;

		if ("error" in job && typeof job.error === "string") {
			throw new ProdiaUserError(job.error);
		}

		if (response.status < 200 || response.status > 299) {
			throw new ProdiaBadResponseError(
				`${response.status} ${response.statusText}`,
			);
		}

		const buffer = Buffer.from(body.output, 'base64');

		return {
			job: job,
			arrayBuffer: () => Promise.resolve(buffer),
		};
	};

	return {
		job,
	};
};
