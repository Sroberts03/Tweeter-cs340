export type authenticationField = {
    id: string;
    type: string;
    placeholder: string;
    label: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
    forRegisterOnly: boolean;
}

export class AuthenticationFieldsPresenter {  
  constructor() {}

  public filterAuthFields (isRegister: boolean, authField: authenticationField[]): authenticationField[] {
        if (isRegister) {
            return authField;
        } else {
            return authField.filter((field: authenticationField) => !field.forRegisterOnly);
        }
    }

}