
export const settings = {
  API: 'http://localhost:5058/api/',
}

export const colorsList = [
  "#d46a7a", // Softer shade of #a8193d
  "#82e173", // Softer shade of #4fcc25
  "#73d4f9", // Softer shade of #1ebffa
  "#b2c5a9", // Softer shade of #8da377
  "#bfa4d5", // Softer shade of #9975bd
  "#e6a6c6", // Softer shade of #cf61a1
  "#6a4d94", // Softer shade of #240959
];

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  return String(error)
}

export const reportError = ({ message }: { message: string }) => {
  // send the error to our logging service...

}

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

