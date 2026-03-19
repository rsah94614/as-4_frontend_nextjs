import { act, renderHook, waitFor } from "@testing-library/react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationStore } from "@/lib/notification-store";

jest.mock("@/lib/notification-store", () => ({
  __esModule: true,
  useNotificationStore: jest.fn(),
}));

const mockState = {
  notifications: [{ notification_id: "n1", is_read: false }],
  unreadCount: 1,
  loading: false,
  error: null,
  fetchNotifications: jest.fn().mockResolvedValue(undefined),
  fetchUnreadCount: jest.fn().mockResolvedValue(undefined),
  markOneAsRead: jest.fn().mockResolvedValue(undefined),
  markAllAsRead: jest.fn().mockResolvedValue(undefined),
};

describe("useNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNotificationStore as unknown as jest.Mock).mockImplementation(() => mockState);
    (useNotificationStore as unknown as { getState: jest.Mock }).getState = jest
      .fn()
      .mockReturnValueOnce({ unreadCount: 1 })
      .mockReturnValueOnce({ unreadCount: 2 });
  });

  it("loads notifications on mount and polls for unread changes", async () => {
    jest.useFakeTimers();
    const { result, unmount } = renderHook(() => useNotifications(25));

    await waitFor(() => expect(mockState.fetchNotifications).toHaveBeenCalledWith(25));

    await act(async () => {
      jest.advanceTimersByTime(30_000);
      await Promise.resolve();
    });

    expect(mockState.fetchUnreadCount).toHaveBeenCalledTimes(1);
    expect(mockState.fetchNotifications).toHaveBeenCalledTimes(2);
    expect(result.current.unreadCount).toBe(1);

    unmount();
    jest.useRealTimers();
  });

  it("returns wrappers for markOne, markAll, and reload", async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.markOne("n1");
      await result.current.markAll();
      await result.current.reload();
    });

    expect(mockState.markOneAsRead).toHaveBeenCalledWith("n1");
    expect(mockState.markAllAsRead).toHaveBeenCalledTimes(1);
    expect(mockState.fetchNotifications).toHaveBeenCalled();
  });
});

