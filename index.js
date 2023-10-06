
const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const app = express();
const port = 9000;

// cache to store the fetched data
let cachedData = null;
let cacheTimestamp = 0;
const cacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

// fetching data from api
async function fetchData() {
  try {
    const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
      headers: {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
      },
    });

    const blogs = response.data.blogs;
    // Checking if blogs is array or not
    if (!Array.isArray(blogs)) {
      throw new Error('The API did not return an array of blogs');
    }

    return blogs;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}

// middleware to fetch and cache data
async function fetchDataWithCache() {
  const currentTime = Date.now();

  if (!cachedData || currentTime - cacheTimestamp > cacheDuration) {
    // Fetch data and update the cache if it's empty or expired
    try {
      cachedData = await fetchData();
      cacheTimestamp = currentTime;
    } catch (error) {
      // Handle errors here
      throw error;
    }
  }

  return cachedData;
}

// middleware to fetch blog data with caching
app.get('/api/blog-stats', async (req, res) => {
  try {
    const blogs = await fetchDataWithCache();

    // Calculate analytics
    const totalBlogs = blogs.length;
    const longestBlog = _.maxBy(blogs, 'title.length');
    const blogsWithPrivacy = blogs.filter((blog) => blog.title.toLowerCase().includes('privacy'));
    const uniqueTitles = _.uniqBy(blogs, 'title');

    const statistics = {
      totalBlogs,
      longestBlog: longestBlog.title,
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueTitles: uniqueTitles.map((blog) => blog.title),
    };

    res.json(statistics);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// blog search endpoint with caching
app.get('/api/blog-search', async (req, res) => {
  const query = req.query.query || '';

  try {
    const blogs = await fetchDataWithCache();

    // implementing search functionality with given query 
    const searchResults = blogs.filter((blog) =>
      blog.title.toLowerCase().includes(query.toLowerCase())
    );

    res.json(searchResults);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});










// const express = require('express');
// const axios = require('axios');
// const _ = require('lodash');

// const app = express();
// const port = 9000;

// // Middleware to fetch blog data
// app.get('/api/blog-stats', async (req, res) => {
//   try {
//     const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
//       headers: {
//         'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
//       },
//     });

//     const blogs = response.data.blogs;
//     // Check if 'blogs' is an array before performing operations
//     if (!Array.isArray(blogs)) {
//         throw new Error('The API did not return an array of blogs');
//       }

//     // Calculate analytics
//     const totalBlogs = blogs.length;
//     const longestBlog = _.maxBy(blogs, 'title.length');
//     const blogsWithPrivacy = blogs.filter((blog) => blog.title.toLowerCase().includes('privacy'));
//     const uniqueTitles = _.uniqBy(blogs, 'title');

//     const statistics = {
//       totalBlogs,
//       longestBlog: longestBlog.title,
//       blogsWithPrivacy: blogsWithPrivacy.length,
//       uniqueTitles: uniqueTitles.map((blog) => blog.title),
//     };

//     res.json(statistics);
//   } catch (error) {
//     console.error('Error fetching data:', error.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Blog search endpoint
// app.get('/api/blog-search', async (req, res) => {
//   const query = req.query.query || '';

//   try {
//     const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
//       headers: {
//         'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
//       },
//     });

//     const blogs = response.data.blogs;
//     // Check if 'blogs' is an array before performing operations
//     if (!Array.isArray(blogs)) {
//         throw new Error('The API did not return an array of blogs');
//       }

//     // Implement search functionality
//     const searchResults = blogs.filter((blog) =>
//       blog.title.toLowerCase().includes(query.toLowerCase())
//     );

//     res.json(searchResults);
//   } catch (error) {
//     console.error('Error fetching data:', error.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });








