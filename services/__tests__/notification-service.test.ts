jest.mock("@/lib/api-utils", () => {
  const mockClient = { get: jest.fn(), put: jest.fn() };
  return {
    __esModule: true,
    createAuthenticatedClient: () => mockClient,
    __mockClient: mockClient,
  };
});

import {
  getUnreadCount,
  getNotifications,
  markOneRead,
  markAllRead,
} from "@/services/notification-service";

const { __mockClient: mockClient } = jest.requireMock("@/lib/api-utils") as {
  __mockClient: { get: jest.Mock; put: jest.Mock };
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("notification-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deduplicates concurrent getNotifications requests", async () => {
    const d = deferred<{ data: { notifications: []; total: 0 } }>();
    mockClient.get.mockReturnValueOnce(d.promise);

    const p1 = getNotifications(20, true);
    const p2 = getNotifications(20, true);
    d.resolve({ data: { notifications: [], total: 0 } });

    const [a, b] = await Promise.all([p1, p2]);
    expect(mockClient.get).toHaveBeenCalledTimes(1);
    expect(a).toEqual({ notifications: [], total: 0 });
    expect(b).toEqual({ notifications: [], total: 0 });
  });

  it("returns zero unread count on unread-count request error", async () => {
    mockClient.get.mockRejectedValueOnce(new Error("down"));
    const count = await getUnreadCount();
    expect(count).toBe(0);
  });

  it("marks notifications as read", async () => {
    mockClient.put
      .mockResolvedValueOnce({ data: { notification_id: "n1" } })
      .mockResolvedValueOnce({ data: { marked_read: 5 } });

    const one = await markOneRead("n1");
    const all = await markAllRead();

    expect(one).toEqual({ notification_id: "n1" });
    expect(all).toBe(5);
  });
});

