import db from "../db.js"

//import isbn , title, author, from db for update book search bar 
let cachedBooks = null

export async function fetchBooksMiddleware(req,res,next){
    try{
      const result = await db.query("SELECT isbn, title, author FROM book");
      cachedBooks = result.rows;
    //   console.log("data in middlewate : ",cachedBooks);
      

    }catch(err){
        console.error("Error fetching books in middleware :", err.message);
        return res.status(500).send("Database error");
    }
  req.booksData = cachedBooks;
  next();
}