# hockeyAnalyzer
Write a webapp that makes comparison of teams easy, using Corsi statistics, scoring chance statistics, trend stats, player stats, and be able to plot these data sets built from those trends. Will make betting so much more convenient.


## Technologies to use?
### Database
A database backend to hold all the data. Here, we are just going to store team data, player data and games played. From this data we can build our own custom Corsi stats, scoring chance stats etc. Then we can also jump to any time, and create a 5-game trend, 10 game trend, or "last month" trend for any given team.
-  SQL
- Mongo (most likely, saving game data is perfect for the ORM/NoSQL format. SQL would make this a horrible nightmare)
  
### Webserver
Node will be used both as web server and backend. I see no point in hooking it up with apache. That way we can just deploy the webapp to something like Heroku, and use mongodb's own webservice (which offers 500 MB of data, which should suffice for all the games of a season).

### Frontend
Vue or perhaps Angular. It seems to me, that Vue is easier to get going, and since we aren't really doing to much fancy stuff, that seems more suitable for this.

This is essentially the most basic look of the application. These examples show the web ui, where a list of today's 
games is displayed, and when game is clicked on, displays some charts for averages (to begin with).
![Example output of goals for/against per game average](example_averages.png)
![Basic UI functionality, showing today's game and a list of averages](example_ui.png)

### Data collection
Webscraping. We need to scrape all this data from some place. www.nhl.com/stats is a good place to start. But it doesn't provide all the data I actually owuld want. Perhaps ESPN has data available for this purpose as well. To scrape the data, we can use cheerio.js. Since the data we will be scraping, will not change in its appearance, we don't need any fancy parsers here neither, at least not to begin with.
