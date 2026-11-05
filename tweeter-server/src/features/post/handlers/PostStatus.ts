import { PostStatusRequest, Status, TweeterResponse } from "tweeter-shared";
import { PostService } from "../PostService";

export async function handler(req: PostStatusRequest): Promise<TweeterResponse> {
    const { token, newStatus } = req;
    const postService = new PostService();
    await postService.postStatus(token, Status.fromDto(newStatus)!);
    return {
        success: true,
        message: "Successfully posted status."
    }
}