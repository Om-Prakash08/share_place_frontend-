import axios from "axios";

const ImageUploadAPI = (imageFile, handleUpload) => {
  let body = new FormData();
  body.set("key", process.env.REACT_APP_IMGBB_SECRET_KEY);
  body.append("image", imageFile);
  axios({
    method: "post",
    url: "/1/upload",
    baseURL: process.env.REACT_APP_IMGBB_URL,
    data: body,
  })
    .then((res) => {
      if (res.data.status === 200) {
        handleUpload(res.data.data.url);
        console.log(res.data.data.url);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

export default ImageUploadAPI;
