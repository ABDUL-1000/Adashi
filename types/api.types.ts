export type ApiResponse<T = undefined> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiMessageResponse = Omit<ApiResponse<undefined>, "data"> & {
  data?: undefined;
};
