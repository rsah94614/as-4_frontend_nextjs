// ─────────────────────────────────────────────────────────────────────────────
// API Route: app/api/upload/presign/route.ts
// ─────────────────────────────────────────────────────────────────────────────

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server"

const s3 = new S3Client({
    region: process.env.NEXT_PUBLIC_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: process.env.AWS_SESSION_TOKEN!,
    },
})

export async function POST(req: NextRequest) {
    const { key, contentType } = await req.json()

    if (!key || !contentType) {
        return NextResponse.json({ error: "key and contentType are required" }, { status: 400 })
    }

    const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
        Key: key,
        ContentType: contentType,
    })

    // URL expires in 5 minutes — plenty of time for the browser to upload
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

    return NextResponse.json({ uploadUrl })
}


