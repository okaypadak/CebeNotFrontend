// src/main.js
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.SERVER_URL

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  console.log('Request URL:', config.baseURL + config.url)
  return config
})

axios.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    if (error.response) {
      console.error('HTTP Error:', error.response.status, error.response.config.url)
    } else if (error.request) {
      console.error('No response received. Request:', error.request)
    } else {
      console.error('Axios error:', error.message)
    }

    throw error
  }
)
