const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

dbPath = path.join(__dirname, "moviesData.db");
db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server running at http://localhost:3000`);
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getAllmoviesQuery = `
    SELECT movie_name FROM movie;
    `;
  const getAllMoviesQueryResponse = await db.all(getAllmoviesQuery);
  response.send(
    getAllMoviesQueryResponse.map((eachMovie) => {
      return {
        movieName: eachMovie.movie_name,
      };
    })
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieNameQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor) 
    VALUES(${directorId},"${movieName}","${leadActor}")
    `;

  const addMovieNameResponse = await db.run(addMovieNameQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
SELECT * FROM movie 
WHERE 
movie_id=${movieId};
`;
  const getMovieResponse = await db.get(getMovieQuery);
  response.send({
    movieId: getMovieResponse.movie_id,
    directorId: getMovieResponse.director_id,
    movieName: getMovieResponse.movie_name,
    leadActor: getMovieResponse.lead_actor,
  });
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `update movie set director_id = ${directorId},
  movie_name = '${movieName}', lead_actor = '${leadActor}' where movie_id = ${movieId};`;
  const updateMovieQueryResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
DELETE FROM movie WHERE movie_id=${movieId}
`;

  const deleteMovieResponse = db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `
SELECT * FROM director ORDER BY director_id
`;
  const getAllDirectorsResponse = await db.all(getAllDirectorsQuery);
  response.send(
    getAllDirectorsResponse.map((eachDirector) => {
      return {
        directorId: eachDirector.director_id,
        directorName: eachDirector.director_name,
      };
    })
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsMoviesQuery = `
SELECT movie_name AS movieName FROM movie WHERE director_id=${directorId}
`;
  const getDirectorsMovieResponse = await db.all(getDirectorsMoviesQuery);
  response.send(getDirectorsMovieResponse);
});

module.exports = app;
