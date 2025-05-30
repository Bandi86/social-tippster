League
------
id (PK)
name

Team
----
id (PK)
name
league_id (FK -> League.id)
founded_year
stadium_name

Player
------
id (PK)
name
birthdate
position
nationality
team_id (FK -> Team.id)
number

Season (opcionális)
------
id (PK)
year_start
year_end

Match (opcionális)
-----
id (PK)
season_id (FK -> Season.id)
home_team_id (FK -> Team.id)
away_team_id (FK -> Team.id)
match_date
home_score
away_score

PlayerStats (opcionális)
------------
id (PK)
match_id (FK -> Match.id)
player_id (FK -> Player.id)
minutes_played
goals
assists
yellow_cards
red_cards
```
