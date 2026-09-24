import { Status } from "tweeter-shared";
import Post from "./Post";
import { Link } from "react-router-dom";

interface StatusItemProps {
  item: Status;
  featurePath: string;
  onClick: (event: React.MouseEvent) => void;
}

export default function StatusItem({ item, featurePath, onClick }: StatusItemProps) {
    return (
        <div className="col bg-light mx-0 px-0">
            <div className="container px-0">
                <div className="row mx-0 px-0">
                    <div className="col-auto p-3">
                    <img
                        src={item.user.imageUrl}
                        className="img-fluid"
                        width="80"
                        alt="Posting user"
                    />
                    </div>
                    <div className="col">
                    <h2>
                        <b>
                        {item.user.firstName} {item.user.lastName}
                        </b>{" "}
                        -{" "}
                        <Link
                        to={`/story/${item.user.alias}`}
                        onClick={onClick}
                        >
                        {item.user.alias}
                        </Link>
                    </h2>
                    {item.formattedDate}
                    <br />
                    <Post status={item} featurePath="/story" />
                    </div>
                </div>
            </div>
        </div>
    );
}