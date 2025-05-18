import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// details to connect to the database
const db = new pg.Client({
  user: 'username',
  host: "localhost",
  database: 'database_name',
  password: 'yourpassword',
  port: 5432,
});

db.connect();

const today = new Date();

// const day = String(today.getDate()).padStart(2, '0');
let month = String(today.getMonth() + 1).padStart(2, '0');
// const year = today.getFullYear();

// const formattedDate = `${day}/${month}/${year}`;

async function getExpenses() {
    const result = await db.query(
        "SELECT id, TO_CHAR(date, 'DD/MM/YYYY') as date, category, title, amount FROM expenses_summary WHERE EXTRACT(MONTH FROM date)=$1 ORDER BY date;",[month]
    );

    let expenses_list = [];
    result.rows.forEach(element => {
        expenses_list.push(element)
    });
    return expenses_list;
};

async function getSumByCat(){
    const result = await db.query("SELECT category, SUM(amount) AS total_amount FROM expenses_summary WHERE EXTRACT(MONTH FROM date)=$1 GROUP BY category;", [month]
    );

    let sum_category = [];
    result.rows.forEach(element => {
        sum_category.push(element)
    });
    return sum_category
};

app.get("/", async (req, res) => {
    const expense_data = await getExpenses();
    const chart_data = await getSumByCat();

    const months = {
        '1': 'January',
        '2': 'February',
        '3': 'March',
        '4': 'April',
        '5': 'May',
        '6': 'June',
        '7': 'July',
        '8': 'August',
        '9': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December'
        };

    let current_month = months[month];

    console.log = current_month
    res.render("index.ejs", {data: expense_data, chart_data: chart_data, current_month: current_month});
});

app.post("/add-expense", async(req,res) => {
    const cat = req.body.category
    const date = req.body.date
    const title = req.body.title
    const amount = req.body.amount
    month = date.substring(5,7);
    await db.query("INSERT INTO expenses_summary (date, category, title, amount) VALUES ($1, $2, $3, $4);", [date, cat, title, amount]);
    res.redirect("/")
});

app.post("/selectMonth", async(req, res) => {
    let selected_month = req.body.month

    if (selected_month == 'January') {
        month = "1"
    } else if (selected_month == 'February'){
        month = "2"
    } else if (selected_month == 'March') {
        month = "3"
    } else if (selected_month == 'April') {
        month = "4"
    } else if (selected_month == 'May') {
        month = "5"
    } else if (selected_month == 'June') {
        month = "6"
    } else if (selected_month == 'July') {
        month = "7"
    } else if (selected_month == 'August') {
        month = "8"
    } else if (selected_month == 'September') {
        month = "9"
    } else if (selected_month == 'October') {
        month = "10"
    } else if (selected_month == 'November') {
        month = "11"
    } else {
        month = "12"
    }
    
    res.redirect("/")
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
