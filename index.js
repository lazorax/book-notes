import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true })); //(parse data from HTML forms (the stuff sent via POST requests with application/x-www-form-urlencoded)body comes as name=Riya&age=21 but this changes to { name: "Riya", age: "21" }
app.use(express.static("public"));

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

db.connect();

let  booksLength =0

app.get("/", async (req, res) => {
  //get all the info from the db
  try {
    const result = await db.query("select * from book");
    // console.log(result.rows.length);
    booksLength = result.rows.length
    res.render("index.ejs", { books: result.rows ,booksLength:booksLength});
  } catch (err) {
    res.render("index.ejs", { error: err.message });
  }
});

app.get("/admin", (req, res) => {
  //render adminlogin.ejs whch has a form
  res.render("adminlogin.ejs");
});

//a function that returns true or fale by checking from db collects uname and password from db
async function checkAdmin(username, password) {
  try {
    if (username) {
      const result = await db.query("select * from admin where username = $1", [
        username,
      ]);
      if (result.rows.length === 0) return false; // username not found
      return result.rows[0].password === password;
    } else {
      throw new Error("No username");
    }
  } catch (err) {
    console.log("from function : ", err.message);
    if (
      err.message === "Cannot read properties of undefined (reading 'username')"
    ) {
      return "Invalid Admin from function";
    } else {
      return err.message;
    }
  }
}

app.post("/admin", async (req, res) => {
  //accept the username and password and check from db to authenticate
  //render addbook.ejs if authentic user or return back to adminlogin.ejs
  const username = req.body.username;
  const password = req.body.password;

  const adminAuthenticateMessage = await checkAdmin(username, password);
  // console.log("received from function in admin : ",adminAuthenticateMessage);

  if (typeof adminAuthenticateMessage === "boolean") {
    if (adminAuthenticateMessage === true) {
      res.render("addbook.ejs", { isvalidAdmin: adminAuthenticateMessage });
    } else {
      res.render("adminlogin.ejs", {
        error: "something is wrong, login failed!",
      });
    }
  } else {
    if (typeof adminAuthenticateMessage === "string") {
      res.render("adminlogin.ejs", { error: adminAuthenticateMessage });
    }
  }
});

app.get("/admin/searchBook", async (req, res) => {
  //check admin authentication then show the book
  if (req.query.isvalidAdmin) {
    try {
      //get isbn number
      const searchISBN = req.query.isbnCode;
      //console.log("User searched for:", searchISBN);
      //get book info from https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data
      const response = await axios.get(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${searchISBN}&format=json&jscmd=data`
      );
      const data = response.data;
      // console.log("data= ",data);

      const key = `ISBN:${searchISBN}`; // data is received as { "ISBN:key" : {book data according to isbn}}
      const bookData = data[key];
      // console.log("bookdata = ",bookData);
      const authorsArray = bookData.authors?.map((author) => author.name);
      const authors = authorsArray.join(", ");
      const bookInfo = {
        isbn: searchISBN,
        title: bookData.title,
        authors: authors,
        cover: bookData.cover?.medium,
      };
      res.render("addbook.ejs", { bookInfo: bookInfo });
    } catch (err) {
      res.render("addbook.ejs", { error: err.message });
    }
  } else {
    res.render("adminlogin.ejs", { error: "Invalid Admin from search book" });
  }
});

app.post("/addbook", async (req, res) => {
  const isbn = req.body.isbn;
  const title = req.body.title;
  const author = req.body.author;
  const rate = req.body.rate;
  const readDate = req.body.readDate;
  const review = req.body.review;
  const notes = req.body.notes;
  const coverImageUrl = req.body.coverImageUrl;

  //saving data in db
  try {
    if (readDate) {
      await db.query(
        "insert into book(isbn,title,author,rating,read_date,review,notes,cover_img_url) values ($1,$2,$3,$4,$5,$6,$7,$8)",
        [isbn, title, author, rate, readDate, review, notes, coverImageUrl]
      );
    } else {
      await db.query(
        "insert into book(isbn,title,author,rating,review,notes,cover_img_url) values ($1,$2,$3,$4,$5,$6,$7)",
        [isbn, title, author, rate, review, notes, coverImageUrl]
      );
    }

    res.redirect("/");
  } catch (err) {
    res.render("addbook.ejs", { error: err.message });
  }
});

app.get("/search/:isbn", async (req, res) => {
  //get specific isbn and provide notes info along with isbn(hidden), title, author, summary , rating, read-date, url-of-the-image
  try {
    const result = await db.query("select * from book where isbn = $1", [
      req.params.isbn,
    ]);
    res.render("book.ejs", { book: result.rows[0] });
  } catch (err) {
    res.render("book.ejs", { error: err.message });
  }
});

app.get("/sort/:filter", async (req, res) => {
  try {
    //get filter - rating , recency, title
    const filter = req.params.filter;
    //sort according to filter
    //get data from db (using oredr by asc - title / desc - rating and recency )
    if (filter === "title") {
      const result = await db.query(
        `select * from book order by ${filter} ASC;`
      ); //RETURNS ARRAY OF OBJS
      res.render("index.ejs", { books: result.rows ,booksLength:booksLength});
    } else {
      const result = await db.query(
        `select * from book order by ${filter} DESC;`
      );
      res.render("index.ejs", { books: result.rows ,booksLength:booksLength});
    }
  } catch (err) {
    res.render("index.ejs", { error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
