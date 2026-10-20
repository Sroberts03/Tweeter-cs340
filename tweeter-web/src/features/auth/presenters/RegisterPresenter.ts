import { AuthToken, User } from "tweeter-shared";
import { AuthService } from "../models.service/AuthService";
import { Buffer } from "buffer";
import { Presenter, View } from "../../../presenter/Presenter";

export interface RegisterView extends View {
  updateUserInfo: (
    user: User,
    displayUser: User,
    authToken: AuthToken,
    rememberMe: boolean,
  ) => void;
  setImageUrl: (imageUrl: string) => void;
  setImageBytes: (imageBytes: Uint8Array) => void;
  setImageFileExtension: (imageFileExtension: string) => void;
  setIsLoading: (loading: boolean) => void;
  navigate: (path: string) => void;
}

export class RegisterPresenter extends Presenter<RegisterView> {
  private authService: AuthService;

  constructor(view: RegisterView) {
    super(view);
    this.authService = new AuthService();
  }

  public async doRegister(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageBytes: Uint8Array | null,
    imageFileExtension: string | null,
    rememberMe: boolean,
  ) {
    this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);

      const [user, authToken] = await this.authService.register(
        firstName,
        lastName,
        alias,
        password,
        imageBytes!,
        imageFileExtension!,
      );

      this.view.updateUserInfo(user, user, authToken, rememberMe);
      this.view.navigate(`/feed/${user.alias}`);
    }, "register user", () => {
      this.view.setIsLoading(false);
    });
  }

  public handleImageFile(file: File | undefined) {
    if (file) {
      this.view.setImageUrl(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const imageStringBase64 = event.target?.result as string;

        // Remove unnecessary file metadata from the start of the string.
        const imageStringBase64BufferContents =
          imageStringBase64.split("base64,")[1];

        const bytes: Uint8Array = Buffer.from(
          imageStringBase64BufferContents,
          "base64",
        );

        this.view.setImageBytes(bytes);
      };
      reader.readAsDataURL(file);

      // Set image file extension (and move to a separate method)
      const fileExtension = this.getFileExtension(file);
      if (fileExtension) {
        this.view.setImageFileExtension(fileExtension);
      }
    } else {
      this.view.setImageUrl("");
      this.view.setImageBytes(new Uint8Array());
    }
  }

  public getFileExtension(file: File): string | undefined {
    return file.name.split(".").pop();
  }

  public registerOnEnter (
    key: string,
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageUrl: string,
    imageBytes: Uint8Array | null,
    imageFileExtension: string,
    rememberMe: boolean
  ) {
    if (key == "Enter" && !this.checkSubmitButtonStatus(
      firstName,
      lastName,
      alias,
      password,
      imageUrl,
      imageFileExtension
    )) {
      this.doRegister(
        firstName,
        lastName,
        alias,
        password,
        imageBytes!,
        imageFileExtension,
        rememberMe
      );
    }
  };

  public checkSubmitButtonStatus(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageUrl: string,
    imageFileExtension: string
  ): boolean {
    return (
      !firstName ||
      !lastName ||
      !alias ||
      !password ||
      !imageUrl ||
      !imageFileExtension
    );
  };
}
