const mockAxios = { post: jest.fn(), put: jest.fn() };

jest.mock("axios", () => ({
  __esModule: true,
  default: mockAxios,
}));

describe("s3 service", () => {
  const originalRegion = process.env.NEXT_PUBLIC_S3_REGION;
  const originalBucket = process.env.NEXT_PUBLIC_S3_BUCKET;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_S3_REGION = originalRegion;
    process.env.NEXT_PUBLIC_S3_BUCKET = originalBucket;
  });

  it("throws when S3 env config is missing", async () => {
    delete process.env.NEXT_PUBLIC_S3_REGION;
    delete process.env.NEXT_PUBLIC_S3_BUCKET;
    const { uploadToStorage } = await import("@/services/s3");

    const file = new File(["img"], "a.jpg", { type: "image/jpeg" });
    await expect(uploadToStorage(file)).rejects.toThrow(/missing s3 config/i);
  });

  it("uploads supported file and returns public metadata", async () => {
    process.env.NEXT_PUBLIC_S3_REGION = "ap-south-1";
    process.env.NEXT_PUBLIC_S3_BUCKET = "bucket-one";
    const uuidSpy = jest.spyOn(global.crypto, "randomUUID").mockReturnValue("uuid-123");
    const { uploadToStorage } = await import("@/services/s3");

    mockAxios.post.mockResolvedValueOnce({ data: { uploadUrl: "https://upload-url" } });
    mockAxios.put.mockResolvedValueOnce({ data: {} });

    const file = new File(["img"], "a.jpg", { type: "image/jpeg" });
    const out = await uploadToStorage(file);

    expect(mockAxios.post).toHaveBeenCalledWith("/api/upload/presign", {
      key: "reviews/images/uuid-123.jpg",
      contentType: "image/jpeg",
    });
    expect(mockAxios.put).toHaveBeenCalledWith(
      "https://upload-url",
      file,
      { headers: { "Content-Type": "image/jpeg" } }
    );
    expect(out.url).toBe("https://bucket-one.s3.ap-south-1.amazonaws.com/reviews/images/uuid-123.jpg");
    expect(out.resourceType).toBe("image");
    uuidSpy.mockRestore();
  });
});

