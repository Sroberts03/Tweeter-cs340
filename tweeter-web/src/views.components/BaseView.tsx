export interface BaseView {
    displayErrorMessage: (message: string) => void;
    displayInfoMessage: (message: string, duration: number) => string;
    deleteMessage: (messageId: string) => void;
    navigate: (path: string) => void;
    setIsLoading: (loading: boolean) => void;
}