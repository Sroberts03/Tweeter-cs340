import { useRef } from "react";
import { authenticationField, AuthenticationFieldsPresenter } from "../presenters/AuthenticationFieldsPresenter";
interface AuthenticationFieldsProps {
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
    onAliasChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFirstNameChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onLastNameChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isRegister: boolean;
}

export default function AuthenticationFields(props: AuthenticationFieldsProps) {
    const authField: authenticationField[] = [
        {
            id: "firstNameInput",
            type: "text",
            placeholder: "First Name",
            label: "First Name",
            onChange: props.onFirstNameChange!,
            onKeyDown: props.onKeyDown,
            forRegisterOnly: true
        },
        {
            id: "lastNameInput",
            type: "text",
            placeholder: "Last Name",
            label: "Last Name",
            onChange: props.onLastNameChange!,
            onKeyDown: props.onKeyDown,
            forRegisterOnly: true
        },
        {
            id: "aliasInput",
            type: "text",
            placeholder: "name@example.com",
            label: "Alias",
            onChange: props.onAliasChange,
            onKeyDown: props.onKeyDown,
            forRegisterOnly: false
        },
        {
            id: "passwordInput",
            type: "password",
            placeholder: "Password",
            label: "Password",
            onChange: props.onPasswordChange,
            onKeyDown: props.onKeyDown,
            forRegisterOnly: false
        }
    ]
    const presenter = useRef<AuthenticationFieldsPresenter | null>(null);
    if (!presenter.current) {
        presenter.current = new AuthenticationFieldsPresenter();
    }

    const filterAuthFields = (): authenticationField[]  => {
        return presenter.current!.filterAuthFields(props.isRegister, authField);
    }
    
    return (
        <div>
            {filterAuthFields().map((field: authenticationField) => (
                <div className="form-floating">
                    <input
                        type={field.type}
                        className="form-control"
                        size={50}
                        id={field.id}
                        placeholder={field.placeholder}
                        onKeyDown={field.onKeyDown}
                        onChange={field.onChange}
                    />
                    <label htmlFor={field.id}>{field.label}</label>
                </div>
            ))}
        </div>
    )
}