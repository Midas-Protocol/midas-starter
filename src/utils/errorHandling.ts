export const handleGenericError = (e: any, errorToast: (input: any) => any) => {
  let message: string;

  if (e instanceof Error) {
    message = e.toString();
  } else {
    message = e.message ?? JSON.stringify(e);
  }

  errorToast({ description: message });
};
