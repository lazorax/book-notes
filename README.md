# Book-notes 

This is my Capstone project where I can display the notes for the books I have read. With feature of Adding, Updating Books only for admin. Visitors can change the view of the display by sorting it by title, rating and recency of the books.

---

## Features

- View list of books I have read
- Sort by title, rating and recency
- Adding and Updating book for admin only 

---

## Tech Stack

**Frontend:** HTML, CSS, EJS, JavaScript  
**Backend:** Node.js, Express.js  
**Database:** PostgreSQL  
**Deployment:** Render  
**Version Control:** Git & GitHub  

---

## ⚙️ Installation & Setup

1. Clone the repository  
   ```bash
   git clone https://github.com/lazorax/book-notes.git
   cd your-repo-name ```

2. Install dependencies

`npm install`


3. Create a .env file and add your database credentials

DATABASE_URL=postgres://username:password@localhost:5432/booksdb


4. Start the server

npm start


or

node index.js


Open your browser and visit

http://localhost:3000

🧩 Folder Structure
.
├── public/           # Static assets (CSS, images, etc.)
├── views/            # EJS templates
├── routes/           # Express route files
├── db/               # Database connection & queries
├── app.js            # Main server file
└── package.json
