import "./Toaster.css";
import { useEffect, useRef } from "react";
import { Toast } from "react-bootstrap";
import { useMessageActions, useMessageList } from "../../hooks/MessageHooks";
import { ToasterPresenter } from "../../presenter/ToasterPresenter";
import { MessageView } from "../../presenter/Presenter";

interface Props {
  position: string;
}

const Toaster = ({ position }: Props) => {
  const messageList = useMessageList();
  const { deleteMessage, displayErrorMessage, displayInfoMessage } = useMessageActions();

  const listener: MessageView = {
    deleteMessage: (messageId: string) => {
      deleteMessage(messageId);
    },
    displayErrorMessage: (message: string) => {
      displayErrorMessage(message);
    },
    displayInfoMessage: (message: string, duration: number): string => {
      return displayInfoMessage(message, duration);
    },
  };
  const presenterRef = useRef<ToasterPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = new ToasterPresenter(listener);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (messageList.length) {
        deleteExpiredToasts();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageList]);

  const deleteExpiredToasts = () => {
    presenterRef.current!.deleteExpiredToasts(messageList);
  };

  return (
    <>
      <div className={`toaster-container ${position}`}>
        {messageList.map((message, i) => (
          <Toast
            id={message.id}
            key={i}
            className={message.bootstrapClasses}
            autohide={false}
            show={true}
            onClose={() => deleteMessage(message.id)}
          >
            <Toast.Header>
              <img
                src="holder.js/20x20?text=%20"
                className="rounded me-2"
                alt=""
              />
              <strong className="me-auto">{message.title}</strong>
            </Toast.Header>
            <Toast.Body>{message.text}</Toast.Body>
          </Toast>
        ))}
      </div>
    </>
  );
};

export default Toaster;
