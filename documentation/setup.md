# How To Setup!

## [<- Back](../README.md)

1. Clone this repo.

## Express Setup
1. Open terminal/cmd in express-mysql-skelton folder and run `npm install`
2. Run `npm run setup` and fill in information.
    - If you mess up, just re-run `npm run setup`

## Database Setup
1. Start an instance of MySql and/or make a new Schema for this project.
    - If you do not have MySql Installed:
        - You can download and install it from [mysql.com](https://dev.mysql.com/downloads/mysql/)
        - Or if you are familiar with docker you can setup a new instance very quickly.
            - If using docker I recomend looking at [Helpful-Dockerfiles](https://github.com/Weasnerb/Helpful-Dockerfiles) to setup a new instance of MySql
2. With SQL `use 'nameOfNewSchema'`
3. Run [setupTables.sql]('../sql/setupTables.sql')