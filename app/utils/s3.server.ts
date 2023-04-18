
import {
  unstable_parseMultipartFormData
} from "@remix-run/node";


import type { UploadHandler } from "@remix-run/node";

import S3 from "aws-sdk/clients/s3";
import cuid from "cuid";


const s3 = new S3({
  region: process.env.BUCKET_REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const uploadHandler: UploadHandler = async ({ stream, name, filename, }) => {

  if (name !== "profile-pic") {
    stream.resume();
    return;
  }

  const { Location } = await s3.upload({
    Bucket: process.env.BUCKET_NAME || "",
    Key: `${cuid()}.${filename.split(".").slice(-1)}`,
    Body: stream,
  })
    .promise();

  return Location;
};

export async function uploadAvatar(request: Request) {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("profile-pic")?.toString() || "";

  return file;
}


