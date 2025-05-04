import jwt from "jsonwebtoken";
const JWT_SECRET: any = process.env.JWT_SECRET;
import client from "..";

export async function context(req: any, params: any) {
  if (req.headers.token == "") {
    return { userId: null };
  }
  try {
    const token = req.headers.token;
    const decodedData: any = jwt.verify(token, JWT_SECRET);

    const userId = decodedData.id;
    const response = await client.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (response == null) {
      throw new Error("User does not exist");
    }
    return { userId };
  } catch (e) {
    return { userId: null };
  }
}
