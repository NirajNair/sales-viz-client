interface Config {
  apiBaseUrl: string;
}

function initConfig(): Config {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl || apiBaseUrl.trim() === "") {
    throw new ConfigurationError(
      "NEXT_PUBLIC_API_BASE_URL is required but not set",
    );
  }

  return { apiBaseUrl };
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export const config = initConfig();
export { ConfigurationError };
