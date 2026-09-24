interface AuthenticationFieldsProps {
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
    onAliasChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isRegister: boolean;
}

type authenticationField = {
    id: string;
    type: string;
    placeholder: string;
    label: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
    forRegisterOnly: boolean;
}

export default function AuthenticationFields(props: AuthenticationFieldsProps) {
    const authField: authenticationField[] = [
        {
            id: "firstNameInput",
            type: "text",
            placeholder: "First Name",
            label: "First Name",
            onChange: props.onAliasChange,
            onKeyDown: props.onKeyDown,
            forRegisterOnly: true
        },
        {
            id: "lastNameInput",
            type: "text",
            placeholder: "Last Name",
            label: "Last Name",
            onChange: props.onAliasChange,
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

    const filterAuthFields = (): authenticationField[]  => {
        if (props.isRegister) {
            return authField;
        } else {
            return authField.filter((field: authenticationField) => !field.forRegisterOnly);
        }
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