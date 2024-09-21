import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const client = await MongoClient.connect(
    process.env.NEXT_PUBLIC_MONGODB_URI as string
  );
  const db = client.db();
  const collection = db.collection("transactions");

  const senderAddress = searchParams.get("address") || "";
  console.log(senderAddress);

  try {
    const latestSenderTransaction = await collection
      .find({ senderAddress })
      .sort({ nonce: -1 })
      .limit(1)
      .toArray();

    let latestNonce = -1; // Default nonce if no transactions found for the sender address
    console.log("latestNonce", latestNonce);
    if (latestSenderTransaction.length > 0) {
      latestNonce = latestSenderTransaction[0].nonce;
    }

    return new NextResponse(JSON.stringify({ nonce: latestNonce }), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching nonce", error },
      { status: 500 }
    );
  } finally {
    client.close();
  }
}
