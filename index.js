// TODOs
// have a choice to select only the year without the month, this requires another value 'None' in the month dropdown

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
let year = today.getFullYear();


// const formattedDate = `${day}/${month}/${year}`;

async function getAvailableCategories() {
    const result = await db.query(
        "SELECT name FROM available_categories"
    );

    let categories_list = [];
    result.rows.forEach(element => {
        categories_list.push(element)
    });

    return categories_list;
}

async function getExpenses() {
    const result = await db.query(
        "SELECT id, TO_CHAR(date, 'DD/MM/YYYY') as date, category, title, amount FROM expenses_summary WHERE EXTRACT(MONTH FROM date)=$1 AND EXTRACT(YEAR FROM date)=$2 ORDER BY date;",[month, year]
    );

    let expenses_list = [];
    result.rows.forEach(element => {
        expenses_list.push(element)
    });
    return expenses_list;
};

async function getSumByCat(){
    const result = await db.query("SELECT category, SUM(amount) AS total_amount FROM expenses_summary WHERE EXTRACT(MONTH FROM date)=$1 AND EXTRACT(YEAR FROM date)=$2 GROUP BY category;", [month, year]
    );

    let sum_category = [];
    result.rows.forEach(element => {
        sum_category.push(element)
    });
    return sum_category
};

async function getTotalSpend(){
    const result = await db.query("SELECT SUM(amount) FROM expenses_summary WHERE EXTRACT(MONTH FROM date)=$1 AND EXTRACT(YEAR FROM date)=$2;",[month, year])
    let sum_spend = [];
    result.rows.forEach(element => {
        sum_spend.push(element)
    });
    return sum_spend;
}

async function getYearsfromDatabase(){
    const result = await db.query('SELECT DISTINCT EXTRACT(YEAR from date) AS year_only FROM expenses_summary;')
    let years_list = [];
    result.rows.forEach(element => {
        years_list.push(element)
    });
    return years_list;
}


app.get("/", async (req, res) => {
    const expense_data = await getExpenses();
    const chart_data = await getSumByCat();
    const total_spend_for_month = await getTotalSpend();
    const years_inDatabase = await getYearsfromDatabase();
    const all_available_categories = await getAvailableCategories()


    if (month.substring(0,1) == "0"){
        month = month.substring(1,2)
    } else {
        month
    }

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
    let current_year = year;

    res.render("index.ejs", {data: expense_data, chart_data: chart_data, current_month: current_month, current_year: current_year, monthly_spend: total_spend_for_month, year_list: years_inDatabase, categories: all_available_categories});
});

app.post('/newcategory', async(req, res) => {
    const newCat = req.body.newcategory;
    await db.query("INSERT INTO available_categories (name) VALUES ($1);", [newCat]);

    res.redirect("/")
})

app.post("/add-expense", async(req,res) => {
    const cat = req.body.category
    const date = req.body.date
    const title = req.body.title
    const amount = req.body.amount

    if (date.substring(5,6) == "0"){
        month = date.substring(6,7)
    } else {
        month = date.substring(5,7)
    }

    await db.query("INSERT INTO expenses_summary (date, category, title, amount) VALUES ($1, $2, $3, $4);", [date, cat, title, amount]);
    
    res.redirect("/")
});

app.post("/selectDate", async(req, res) => {
    let selected_month = req.body.month
    let selected_year = req.body.year
    year = selected_year;

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

app.post("/delete", async(req, res) => {
    const toDelete = req.body.expensetoDelete;

    await db.query("DELETE FROM expenses_summary WHERE id=$1;",[toDelete]);
    res.redirect("/")
});

app.post("/edit", async (req, res) => {
    const item = req.body.updatedItemTitle;
    const id = req.body.updatedItemId;
    const item_amount = parseFloat(req.body.updatedItemAmount);

    console.log(item_amount)
  
    await db.query("UPDATE expenses_summary SET title = $1 , amount = $2  WHERE id = $3", [item, item_amount ,id]);
    res.redirect("/");
 
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
