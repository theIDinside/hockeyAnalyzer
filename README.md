# hockeyAnalyzer
Write a webapp that makes comparison of teams easy, using Corsi statistics, scoring chance statistics, trend stats, player stats, and be able to plot these data sets built from those trends. Will make betting so much more convenient.


## Technologies to use?
[x] - Database: A database backend to hold all the data. Here, we are just going to store team data, player data and games played. From this data we can build our own custom Corsi stats, scoring chance stats etc. Then we can also jump to any time, and create a 5-game trend, 10 game trend, or "last month" trend for any given team.
#### Examples
  -  SQL
  - Mongo (most likely, saving game data is perfect for the ORM/NoSQL format. SQL would make this a horrible nightmare)
  
[x] - Node will be used both as web server and backend. I see no point in hooking it up with apache. That way we can just deploy the webapp to something like Heroku, and use mongodb's own webservice (which offers 500 MB of data, which should suffice for all the games of a season).
 
[x] - Webscraping. We need to scrape all this data from some place. www.nhl.com/stats is a good place to start. But it doesn't provide all the data I actually owuld want. Perhaps ESPN has data available for this purpose as well. 
