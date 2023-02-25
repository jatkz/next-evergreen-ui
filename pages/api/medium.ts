import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export type TDCandlesRecord = {
  datetime: number; // Unix timestamp in milliseconds
  open: number; // Open price
  high: number; // High price
  low: number; // Low price
  close: number; // Close price
  volume: number; // Volume
};

export type TDCandles = {
  symbol: string;
  candles: TDCandlesRecord[];
  meanVolume: number;
  stdVolume: number;
};

export const fetchTopMedium = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("tdameritrade");

    const stocks = await db
      .collection("Medium")
      .find({})
      .sort({ stdVolume: -1 })
      .limit(10)
      .toArray();

    return { medium: JSON.parse(JSON.stringify(stocks)) } as {
      medium: TDCandles[];
    };
  } catch (e) {
    console.error(e);
  }
};

export type MediumHandlerResponse =
  | {
      medium: TDCandles[];
    }
  | { err: string };

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<MediumHandlerResponse>
) => {
  await fetchTopMedium().then((data) => {
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(500).json({ err: "Internal server error" });
    }
  });
};

export default handler;
