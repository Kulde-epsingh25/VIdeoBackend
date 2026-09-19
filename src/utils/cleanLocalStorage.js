import fs from "fs";

const cleanLocalStorage = (files = []) => {
   try {
        files.forEach(file => {
            if (file && fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });
    } catch (error) {
        console.error("Error cleaning local storage:", error);
    }
};
export { cleanLocalStorage };