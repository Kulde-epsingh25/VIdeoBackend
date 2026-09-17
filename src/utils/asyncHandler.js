 const asyncHandler = (requestHandler) => {
     return  (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .reject((error) => {
            next(error);
        });
    }
 }





// This is a higher-order function that takes an asynchronous function (fn) as an argument and returns a new function that wraps the original function in a try-catch block. This allows us to handle errors in asynchronous functions more easily, without having to write repetitive try-catch blocks in each route handler.
// const asyncHandler = () => {} 
// const asyncHandler = (fn) => () => {}
// const asyncHandler = (fn) => async () => {} 
 

/* const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);

    } catch (error) {
        next(error); 
    }
}
*/

export { asyncHandler }