import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); //cb is a callback function that takes two arguments: an error  and path destination
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });


  export const upload = multer({ storage: storage });