interface AxiosErrorResponse {
  response: {
    data: {
      detail?: string | { msg: string }[];
      message?: string;
    };
  };
}

function isAxiosError(error: unknown): error is AxiosErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response: unknown }).response === "object" &&
    "data" in (error as { response: { data: unknown } }).response &&
    typeof (error as { response: { data: unknown } }).response.data === "object"
  );
}

export { isAxiosError };
