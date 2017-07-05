CREATE TYPE game_state AS ENUM ('GAME_STATE_PLAYING', 'GAME_STATE_FINISHED');
CREATE TYPE passing_strategy AS ENUM (
       'PASSING_STRATEGY_DEFAULT',
       'PASSING_STRATEGY_HOLD',
       'PASSING_STRATEGY_DEFAULT_3_PLAYER',
       'PASSING_STRATEGY_DEFAULT_5_PLAYER'
       );

CREATE TABLE hearts_game (
       id                    BIGSERIAL PRIMARY KEY,
       jack_of_diamonds      boolean,
       blood_on_first_trick  boolean,
       max_points            int,
       first_player          text REFERENCES hearts_users(username),
       game_state            game_state
       

);

CREATE TABLE hearts_game_players (
       game_id                 bigint REFERENCES hearts_game(id),
       player                  text REFERENCES hearts_users(username)
       );
