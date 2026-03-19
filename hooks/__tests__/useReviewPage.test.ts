import { act, renderHook, waitFor } from "@testing-library/react";
import { useReviewPage } from "@/hooks/useReviewPage";
import { getTeamMembersForUI } from "@/services/employee-service";
import { uploadToStorage } from "@/services/s3";

jest.mock("@/lib/api-utils", () => {
  const mockRecognitionClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  };
  const mockRequireAuthenticatedUserId = jest.fn();
  return {
    __esModule: true,
    createAuthenticatedClient: () => mockRecognitionClient,
    requireAuthenticatedUserId: mockRequireAuthenticatedUserId,
    __mockApiUtils: { mockRecognitionClient, mockRequireAuthenticatedUserId },
  };
});

jest.mock("@/services/employee-service", () => ({
  __esModule: true,
  getTeamMembersForUI: jest.fn(),
}));

jest.mock("@/services/s3", () => ({
  __esModule: true,
  uploadToStorage: jest.fn(),
}));

const mockedGetTeamMembersForUI = getTeamMembersForUI as jest.MockedFunction<typeof getTeamMembersForUI>;
const mockedUploadToStorage = uploadToStorage as jest.MockedFunction<typeof uploadToStorage>;
const { __mockApiUtils } = jest.requireMock("@/lib/api-utils") as {
  __mockApiUtils: {
    mockRecognitionClient: { get: jest.Mock; post: jest.Mock; put: jest.Mock };
    mockRequireAuthenticatedUserId: jest.Mock;
  };
};

describe("useReviewPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __mockApiUtils.mockRequireAuthenticatedUserId.mockReturnValue("me-1");
    mockedGetTeamMembersForUI.mockResolvedValue({
      teamLeader: { id: "lead-1", name: "Lead" },
      teamMembers: [{ id: "m-1", name: "Alice" }],
    } as any);
    mockedUploadToStorage.mockResolvedValue({ url: "https://cdn/test.png" } as any);

    __mockApiUtils.mockRecognitionClient.get.mockImplementation(async (url: string) => {
      if (url.includes("/review-categories")) {
        return {
          data: {
            data: [
              {
                category_id: "c-1",
                category_name: "Collaboration",
                category_code: "COLLAB",
                multiplier: 1.2,
                is_active: true,
              },
            ],
          },
        };
      }
      if (url.includes("/reviews")) {
        return {
          data: {
            data: [
              {
                review_id: "r-1",
                reviewer_id: "me-1",
                receiver_id: "m-1",
                comment: "Great work this sprint",
                review_at: new Date().toISOString(),
                category_ids: ["c-1"],
              },
            ],
            pagination: { total: 1, total_pages: 1 },
          },
        };
      }
      return { data: {} };
    });
  });

  it("loads bootstrap data and computes initial state", async () => {
    const { result } = renderHook(() => useReviewPage());
    await waitFor(() => expect(result.current.loadingData).toBe(false));

    expect(result.current.myId).toBe("me-1");
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.teamMembers).toHaveLength(1);
    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.totalReviews).toBe(1);
  });

  it("shows validation toast when composing without receiver", async () => {
    const { result } = renderHook(() => useReviewPage());
    await waitFor(() => expect(result.current.loadingData).toBe(false));

    await act(async () => {
      result.current.setCategoryIds(["c-1"]);
      result.current.setComment("This is a valid comment");
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(result.current.toast?.kind).toBe("error");
    expect(result.current.toast?.msg).toMatch(/select who to review/i);
    expect(__mockApiUtils.mockRecognitionClient.post).not.toHaveBeenCalled();
  });

  it("submits a compose review and transitions to submitted view", async () => {
    __mockApiUtils.mockRecognitionClient.post.mockResolvedValueOnce({ data: { ok: true } });
    const { result } = renderHook(() => useReviewPage());
    await waitFor(() => expect(result.current.loadingData).toBe(false));

    await act(async () => {
      result.current.setReceiverId("m-1");
      result.current.setCategoryIds(["c-1"]);
      result.current.setComment("Excellent collaboration throughout this month.");
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(__mockApiUtils.mockRecognitionClient.post).toHaveBeenCalledWith("/reviews", {
      receiver_id: "m-1",
      category_ids: ["c-1"],
      comment: "Excellent collaboration throughout this month.",
    });
    expect(result.current.view).toBe("submitted");
    expect(result.current.submittedData?.receiverName).toBe("Alice");
  });
});

