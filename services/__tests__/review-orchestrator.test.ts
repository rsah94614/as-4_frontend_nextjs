jest.mock("@/lib/api-utils", () => {
  const mockRecognitionClient = { get: jest.fn(), post: jest.fn() };
  const mockRequireUserId = jest.fn();
  const mockCategorize = jest.fn();
  return {
    __esModule: true,
    createAuthenticatedClient: () => mockRecognitionClient,
    requireAuthenticatedUserId: mockRequireUserId,
    categorizeFileUrls: mockCategorize,
    __mockApi: { mockRecognitionClient, mockRequireUserId, mockCategorize },
  };
});

jest.mock("@/services/s3", () => ({
  __esModule: true,
  uploadToStorage: jest.fn(),
}));

import {
  fetchMonthlyReviewState,
  invalidateMonthlyReviewState,
  submitReview,
  listReviews,
} from "@/services/review-orchestrator";
import { uploadToStorage } from "@/services/s3";

const { __mockApi } = jest.requireMock("@/lib/api-utils") as {
  __mockApi: {
    mockRecognitionClient: { get: jest.Mock; post: jest.Mock };
    mockRequireUserId: jest.Mock;
    mockCategorize: jest.Mock;
  };
};

const mockedUpload = uploadToStorage as jest.MockedFunction<typeof uploadToStorage>;

describe("review-orchestrator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    invalidateMonthlyReviewState();
    __mockApi.mockRequireUserId.mockReturnValue("me-1");
  });

  it("computes monthly review state from paginated review list", async () => {
    __mockApi.mockRecognitionClient.get
      .mockResolvedValueOnce({
        data: {
          data: [
            { reviewer_id: "me-1", receiver_id: "u1", review_at: new Date().toISOString() },
            { reviewer_id: "other", receiver_id: "u2", review_at: new Date().toISOString() },
          ],
          pagination: { has_next: true },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [{ reviewer_id: "me-1", receiver_id: "u3", review_at: new Date().toISOString() }],
          pagination: { has_next: false },
        },
      });

    const state = await fetchMonthlyReviewState();
    expect(state.reviewsUsed).toBe(2);
    expect(state.reviewedReceiverIds.has("u1")).toBe(true);
    expect(state.reviewedReceiverIds.has("u3")).toBe(true);
  });

  it("blocks self-review before upload/post", async () => {
    __mockApi.mockRecognitionClient.get.mockResolvedValueOnce({
      data: { data: [], pagination: { has_next: false } },
    });

    await expect(
      submitReview({
        receiverId: "me-1",
        categoryIds: ["cat1"],
        comment: "This is a valid comment.",
      })
    ).rejects.toThrow(/cannot review yourself/i);

    expect(mockedUpload).not.toHaveBeenCalled();
    expect(__mockApi.mockRecognitionClient.post).not.toHaveBeenCalled();
  });

  it("submits review and returns updated remaining count", async () => {
    __mockApi.mockCategorize.mockReturnValue({ imageUrl: "https://img", videoUrl: undefined });
    mockedUpload.mockResolvedValue({
      url: "https://img",
      publicId: "p1",
      resourceType: "image",
      format: "jpg",
      bytes: 10,
    });

    __mockApi.mockRecognitionClient.get
      .mockResolvedValueOnce({ data: { data: [], pagination: { has_next: false } } })
      .mockResolvedValueOnce({ data: { data: [], pagination: { has_next: false } } });
    __mockApi.mockRecognitionClient.post.mockResolvedValueOnce({ data: { review_id: "r1" } });

    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
    const out = await submitReview({
      receiverId: "u9",
      categoryIds: ["cat1"],
      comment: "Excellent collaboration this month.",
      files: [file],
    });

    expect(__mockApi.mockRecognitionClient.post).toHaveBeenCalledWith("/reviews", {
      receiver_id: "u9",
      category_ids: ["cat1"],
      comment: "Excellent collaboration this month.",
      image_url: "https://img",
    });
    expect(out.review).toEqual({ review_id: "r1" });
  });

  it("lists reviews with paging query", async () => {
    __mockApi.mockRecognitionClient.get.mockResolvedValueOnce({ data: { data: [], pagination: {} } });
    await listReviews(2, 40);
    expect(__mockApi.mockRecognitionClient.get).toHaveBeenCalledWith("/reviews?page=2&page_size=40");
  });
});

