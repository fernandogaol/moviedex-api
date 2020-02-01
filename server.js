require('dotenv').config();
const express = require('express'),
  morgan = require('morgan'),
  cors = require('cors'),
  helmet = require('helmet'),
  moviedex = require('./moviedex.json'),
  app = express(),
  PORT = process.env.PORT || 8000,
  morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(cors());
app.use(helmet());
app.use(morgan(morganSetting));

app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization');
  const apiToken = process.env.API_TOKEN;

  if (!authToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  if (authToken.split(' ')[1] !== apiToken) {
    return res
      .status(401)
      .json({ error: 'Invalid key. Please enter the correct key' });
  }
  next();
});

// validation for genreTypes
const GenreTypes = [
  'Drama',
  'Thriller',
  'War',
  'Comedy',
  'Western',
  'Crime',
  'Grotesque',
  'Fantasty',
  'Romantic',
  'Musical',
  'Biography',
  'History',
  'Adventure',
  'Spy',
  'Action'
];

function handleGetMovie(req, res) {
  const { genre, country, avg_vote } = req.query;
  const regex = new RegExp('^[a-zA-Z]+$');
  //somewhat global variable for multiple queries for later polishing
  let movieList = moviedex;
  if (!genre && !country && !avg_vote) {
    return res.json(movieList);
  }
  if (genre) {
    // add genre validation
    if (!regex.test(genre)) {
      return res.status(400).send({ error: 'Genre must be a word' });
    }
    const movies = moviedex.filter(movie => {
      return movie.genre.toLowerCase().includes(genre.toLowerCase());
    });
    return movies.length > 0 ? res.json(movies) : res.send('No Movies Found');
  }
  if (country) {
    // add country validation
    if (!regex.test(country)) {
      return res.status(400).send({ error: 'Country must be a word' });
    }
    const movies = moviedex.filter(movie => {
      return movie.country.toLowerCase().includes(country.toLowerCase());
    });
    return movies.length > 0 ? res.json(movies) : res.send('No Movies Found');
  }
  if (avg_vote) {
    if (avg_vote > 10 || avg_vote < 0) {
      return res
        .status(400)
        .send({ error: 'Select a number between 0 and 10' });
    }
    const movies = moviedex.filter(movie => {
      return Number(movie.avg_vote) >= Number(avg_vote);
    });
    return movies.length > 0 ? res.json(movies) : res.send('No Movies Found');
  }
}

app.get('/movie', handleGetMovie);

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

app.listen(PORT, () => {
  PORT;
});
