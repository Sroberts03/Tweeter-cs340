import { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface OauthProps {
    oAuthHeading: string;
    displayInfoMessageWithDarkBackground: (message: string) => void;
}

type OauthOption = {
    id: string;
    icon: [IconPrefix, IconName];
    tooltip: string;
}

export default function Oauth(props: OauthProps) {
    const oAuthOptions: OauthOption[] = [
        {
            id: "google",
            icon: ["fab", "google"],
            tooltip: "Google"
        },
        {
            id: "facebook",
            icon: ["fab", "facebook"],
            tooltip: "Facebook"
        },
        {
            id: "twitter",
            icon: ["fab", "twitter"],
            tooltip: "Twitter"
        },
        {
            id: "linkedin",
            icon: ["fab", "linkedin"],
            tooltip: "LinkedIn"
        },
        {
            id: "github",
            icon: ["fab", "github"],
            tooltip: "GitHub"
        }
    ]
    return (
        <div>
            <h1 className="h4 mb-3 fw-normal">Or</h1>
            <h1 className="h5 mb-3 fw-normal">{props.oAuthHeading}</h1>

            <div className="text-center mb-3">
                {oAuthOptions.map((option: OauthOption) => (
                    <button
                        type="button"
                        className="btn btn-link btn-floating mx-1"
                        onClick={() =>
                            props.displayInfoMessageWithDarkBackground(
                                `${option.tooltip} registration is not implemented.`
                            )
                        }
                    >
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="googleTooltip">{option.tooltip}</Tooltip>}
                        >
                        <FontAwesomeIcon icon={option.icon} />
                        </OverlayTrigger>
                    </button>
                ))}
            </div>
        </div>
    )
}