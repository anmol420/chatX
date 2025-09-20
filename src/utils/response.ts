interface Response<T = any> {
    statusCode: number;
    message: string;
    data: T;
}

interface ErrorResponse {
    statusCode: number;
    message: string,
}

export const successResponse = <T>(statusCode: number, message: string, data: T): Response<T> => ({
    statusCode,
    message,
    data,
});

export const errorResponse = (statusCode: number, message: string): ErrorResponse => ({
    statusCode,
    message,
});