require('dotenv').config()
const express = require('express'),
  morgan = require('morgan'),
  cors = require('cors'),
  helmet = require('helmet'),
  moviedex = require('./moviedex.json'),
  app = express(),
  PORT = 8000 || process.env.PORT;

app.use(cors());
app.use(helmet());
app.use(morgan('common'));
app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization')
  const apiToken = process.env.API_TOKEN;
  
  if(! authToken || authToken.split(' ')[1] !== apiToken){
    return res.status(401).json({ error: 'Unauthorized request' })
  };
  next();
});

// validation for genreTypes
const GenreTypes = ["Drama","Thriller","War","Comedy","Western","Crime","Grotesque","Fantasty","Romantic","Musical","Biography","History","Adventure","Spy","Action"]

function handleGetMovie(req,res){
  const { genre, country, avg_vote} = req.query
  if(!genre && !country && !avg_vote){
    return res.json(moviedex)
  };
  if(genre){
    // genre validation
    const movies = moviedex.filter(movie =>{
      return movie.genre.toLowerCase().includes(genre.toLowerCase())
    })
    return res.json(movies)
  }
  if(country){
    // country validation
    const movies = moviedex.filter(movie =>{
      return movie.country.toLowerCase().includes(country.toLowerCase())
    })
    return res.json(movies)
  }
  if(avg_vote){
    // avg_vote validation
    console.log(avg_vote)
    const movies = moviedex.filter(movie =>{
      console.log(movie.avg_vote)
      return Number(movie.avg_vote) >= Number(avg_vote)
    })
    return res.json(movies)
  }
};

app.get('/movie', handleGetMovie);


app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
});