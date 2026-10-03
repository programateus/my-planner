export const createStrokeId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `stroke_${timestamp}_${randomStr}`;
};
