export interface CustomErrInterface {
    status: number;
    statusText?: string;
    url?: string;
    message: string;
}
export const NoError: CustomErrInterface = {
    status: -1,
    statusText: '',
    url: '',
    message: ''
};
