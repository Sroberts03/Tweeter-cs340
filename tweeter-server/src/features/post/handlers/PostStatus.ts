import { AuthToken, PostStatusRequest, Status, TweeterResponse } from "tweeter-shared";
import { DynamoDaoFactory } from "../../../dal/dao/DynamoDaoFactory";
import { PostService } from "../PostService";

export async function handler(req: PostStatusRequest): Promise<TweeterResponse> {
    const { authToken, newStatus } = req ?? {};
    if (!authToken) {
        throw new Error("[Bad Request] An auth token is required");
    }
    if (!newStatus || !newStatus.user || !newStatus.post?.trim()) {
        throw new Error("[Bad Request] A status with non-empty text is required");
    }

    const postService = new PostService(new DynamoDaoFactory());
    await postService.postStatus(AuthToken.fromDto(authToken)!, Status.fromDto(newStatus)!);
    return {
        success: true,
        message: "Successfully posted status."
    }
}
