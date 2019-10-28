#!/bin/bash
##################################################################################################################
# A startup script that starts the scraping and server locally, using the database nhltest, instead of the
# non-debug version nhl, whether it is remotely or local. Run script is called localtest, but doesn't 
# necessarily have to be for use with local databases. 
#
# Usage:
# 1. ./localtest.sh <SCRAPE_TYPE> 
#    Where <SCRAPE_TYPE> is either GAME_INFO_ONLY, GAMES_ONLY or ALL
# 2. ./localtest.sh
#    Instead of using (1), the script will ask for what type of scraping is suppopsed to be done.
#
##################################################################################################################
alias setupdb="/usr/bin/node ./src/setup.js"

echo "Setting up environment variables"

debugdb_=$DEBUGDB
season_=$SEASON
scrape_type_=$SCRAPE_TYPE

function clean_up_and_exit { # Unsets the environement variables after scrape setup of the db
    echo "Cleaning up environment variables and exiting."
    export DEBUGDB=$debugdb_
    export SEASON=$season_
    export SCRAPE_TYPE=$scrape_type_
    exit
}

export DEBUGDB="ON"
export SEASON="19/20"


if [ -z "$1" ];
then
    # export SCRAPE_TYPE="GAME_INFO_ONLY"
    echo "No scrape type passed in as parameter to script. Enter choice: (1 2 or A)"
    echo "(1): Game Info scraping only"
    echo "(2): Game Results scraping only"
    echo "(A): All"
    read -p "Choice: " answer
    operation=${answer^}
    case "$operation" in
        1) 
            echo "Scrape set to Game Info only: SCRAPE_TYPE=\"GAME_INFO_ONLY\""
            export SCRAPE_TYPE="GAME_INFO_ONLY"
            ;;
        2) 
            echo "Scrape set to Game Results only. SCRAPE_TYPE=\"GAMES_ONLY\""
            export SCRAPE_TYPE="GAMES_ONLY"
            ;;
        A) 
            echo "Scrape set to scrape all. SCRAPE_TYPE=\"ALL\""
            export SCRAPE_TYPE="ALL"
            ;;
        *) 
            echo "You need to enter either 1, 2 or a/A. You entered $answer Exiting..." 
            clean_up_and_exit
            ;;
    esac
else 
        case "$1" in
        GAME_INFO_ONLY) 
            echo "Scrape set to Game Info only: SCRAPE_TYPE=\"GAME_INFO_ONLY\""
            export SCRAPE_TYPE="GAME_INFO_ONLY"
            ;;
        GAMES_ONLY) 
            echo "Scrape set to Game Results only. SCRAPE_TYPE=\"GAMES_ONLY\""
            export SCRAPE_TYPE="GAMES_ONLY"
            ;;
        ALL) 
            echo "Scrape set to scrape all. SCRAPE_TYPE=\"ALL\""
            export SCRAPE_TYPE="ALL"
            ;;
        *) 
            echo "Scrape type variable not properly set. Exiting."
            clean_up_and_exit
            ;;
    esac
fi

export SETUPVARS=$DEBUGDB:$SEASON:$SCRAPE_TYPE
echo "Variables set: $SETUPVARS"

echo "Proceed with scraping, press any key... (Press q to quit)"
read ans
foo=${ans^}
if [[ $foo == "Q" ]];
then
	clean_up_and_exit
fi

echo "Scraping GameInfo data for season $SEASON"
/usr/bin/node ./src/setup.js
echo "Done."

echo "Scraping Played Game data for season $SEASON"
# setupdb
echo "Done."


echo "Starting server..."
# node 

clean_up_and_exit
